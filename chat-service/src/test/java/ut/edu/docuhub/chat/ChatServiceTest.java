package ut.edu.docuhub.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import ut.edu.docuhub.chat.dto.ChatAnswerDto;
import ut.edu.docuhub.chat.dto.CreateSessionRequest;
import ut.edu.docuhub.client.DocumentClient;
import ut.edu.docuhub.common.internal.DocumentInfo;
import ut.edu.docuhub.common.security.AuthPrincipal;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock ChatSessionRepository sessionRepository;
    @Mock ChatMessageRepository messageRepository;
    @Mock DocumentChunkRepository chunkRepository;
    @Mock DocumentClient documentClient;
    @Mock EmbeddingService embeddingService;
    @Mock LlmService llmService;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    private void loginAs(long id, String role) {
        AuthPrincipal principal = new AuthPrincipal(id, "user" + id + "@docuhub.vn", role);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }

    private ChatService service() {
        return new ChatService(sessionRepository, messageRepository, chunkRepository,
                documentClient, embeddingService, llmService, 4);
    }

    private ChatSession sessionOf(long userId) {
        ChatSession s = new ChatSession();
        s.setUserId(userId);
        return s;
    }

    private DocumentInfo docInfo(long id, long ownerId, String title, String summary) {
        return new DocumentInfo(id, ownerId, title, "Java", "pdf", true, summary);
    }

    @Test
    void sendMessage_savesUserAndAssistantMessages() {
        loginAs(1L, "USER");
        when(sessionRepository.findById(5L)).thenReturn(Optional.of(sessionOf(1L)));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(embeddingService.embed(anyString())).thenReturn(new float[] {0.1f, 0.2f});
        when(chunkRepository.findByOwnerId(1L)).thenReturn(List.of());
        when(llmService.chat(anyString())).thenReturn("Đáp án từ tài liệu");

        ChatAnswerDto dto = service().sendMessage(5L, "Câu hỏi?");

        assertThat(dto.userMessage().content()).isEqualTo("Câu hỏi?");
        assertThat(dto.assistantMessage().content()).isEqualTo("Đáp án từ tài liệu");
        assertThat(dto.assistantMessage().role()).isEqualTo("ASSISTANT");
        verify(messageRepository, times(2)).save(any(ChatMessage.class));
    }

    @Test
    void sendMessage_ranksClosestChunkFirstInContext() {
        loginAs(1L, "USER");
        ChatSession session = sessionOf(1L);
        session.setDocumentIds(new LinkedHashSet<>(List.of(7L)));
        when(sessionRepository.findById(5L)).thenReturn(Optional.of(session));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(embeddingService.embed(anyString())).thenReturn(new float[] {1f, 0f});
        when(chunkRepository.findByDocumentIdIn(any())).thenReturn(List.of(
                new DocumentChunk(7L, 1L, "Tài liệu", 0, "gần", "[1,0]"),
                new DocumentChunk(7L, 1L, "Tài liệu", 1, "xa", "[0,1]")));
        when(embeddingService.fromJson("[1,0]")).thenReturn(new float[] {1f, 0f});
        when(embeddingService.fromJson("[0,1]")).thenReturn(new float[] {0f, 1f});
        when(embeddingService.cosine(any(), any()))
                .thenAnswer(inv -> (double) ((float[]) inv.getArgument(1))[0]);
        when(documentClient.getDocuments(any())).thenReturn(List.of());
        when(llmService.chat(anyString())).thenReturn("ok");

        service().sendMessage(5L, "hỏi");

        ArgumentCaptor<String> prompt = ArgumentCaptor.forClass(String.class);
        verify(llmService).chat(prompt.capture());
        assertThat(prompt.getValue().indexOf("gần")).isLessThan(prompt.getValue().indexOf("xa"));
    }

    @Test
    void sendMessage_promptIncludesHistorySummaryAndSourceLabels() {
        loginAs(1L, "USER");
        ChatSession session = sessionOf(1L);
        session.setDocumentIds(new LinkedHashSet<>(List.of(7L)));
        when(sessionRepository.findById(5L)).thenReturn(Optional.of(session));
        when(messageRepository.findBySessionIdOrderByCreatedAtAsc(5L))
                .thenReturn(List.of(new ChatMessage(session, MessageRole.USER, "câu hỏi trước đó")));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(embeddingService.embed(anyString())).thenReturn(new float[] {1f});
        when(chunkRepository.findByDocumentIdIn(any()))
                .thenReturn(List.of(new DocumentChunk(7L, 1L, "Giáo trình Java", 0,
                        "nội dung đoạn", "[1]")));
        when(documentClient.getDocuments(any()))
                .thenReturn(List.of(docInfo(7L, 1L, "Giáo trình Java", "- OOP cơ bản")));
        when(llmService.chat(anyString())).thenReturn("ok");

        service().sendMessage(5L, "hỏi tiếp");

        ArgumentCaptor<String> prompt = ArgumentCaptor.forClass(String.class);
        verify(llmService).chat(prompt.capture());
        assertThat(prompt.getValue())
                .contains("Sinh viên: câu hỏi trước đó")
                .contains("[S1] Tài liệu \"Giáo trình Java\" (đoạn 1)")
                .contains("- OOP cơ bản");
    }

    @Test
    void sendMessage_summaryFetchFails_stillAnswers() {
        loginAs(1L, "USER");
        ChatSession session = sessionOf(1L);
        session.setDocumentIds(new LinkedHashSet<>(List.of(7L)));
        when(sessionRepository.findById(5L)).thenReturn(Optional.of(session));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(embeddingService.embed(anyString())).thenReturn(new float[] {1f});
        when(chunkRepository.findByDocumentIdIn(any()))
                .thenReturn(List.of(new DocumentChunk(7L, 1L, "Tài liệu", 0, "nội dung", "[1]")));
        // document-service sập lúc lấy tóm tắt — chat vẫn phải trả lời được
        when(documentClient.getDocuments(any())).thenThrow(new RuntimeException("connection refused"));
        when(llmService.chat(anyString())).thenReturn("vẫn ok");

        ChatAnswerDto dto = service().sendMessage(5L, "hỏi");

        assertThat(dto.assistantMessage().content()).isEqualTo("vẫn ok");
        ArgumentCaptor<String> prompt = ArgumentCaptor.forClass(String.class);
        verify(llmService).chat(prompt.capture());
        assertThat(prompt.getValue()).contains("(chưa có tóm tắt)");
    }

    @Test
    void sendMessage_otherUserSession_throwsAccessDenied() {
        loginAs(2L, "USER");
        when(sessionRepository.findById(5L)).thenReturn(Optional.of(sessionOf(1L)));

        assertThatThrownBy(() -> service().sendMessage(5L, "hi"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void sendMessage_extractsOnlyCitedSourcesInOrder() {
        loginAs(1L, "USER");
        ChatSession session = sessionOf(1L);
        session.setDocumentIds(new LinkedHashSet<>(List.of(7L)));
        when(sessionRepository.findById(5L)).thenReturn(Optional.of(session));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(embeddingService.embed(anyString())).thenReturn(new float[] {1f});
        when(chunkRepository.findByDocumentIdIn(any())).thenReturn(List.of(
                new DocumentChunk(7L, 1L, "Giáo trình Java", 0, "đoạn về OOP", "[1]"),
                new DocumentChunk(7L, 1L, "Giáo trình Java", 1, "đoạn về kế thừa", "[1]"),
                new DocumentChunk(7L, 1L, "Giáo trình Java", 2, "đoạn không dùng", "[1]")));
        when(documentClient.getDocuments(any())).thenReturn(List.of());
        // Trích [S2] trước [S1]; [S9] ngoài phạm vi phải bị bỏ qua
        when(llmService.chat(anyString())).thenReturn("Kế thừa [S2] và OOP [S1]. Bịa [S9].");

        ChatAnswerDto dto = service().sendMessage(5L, "hỏi");

        assertThat(dto.assistantMessage().sources()).hasSize(2);
        assertThat(dto.assistantMessage().sources().get(0).label()).isEqualTo("S2");
        assertThat(dto.assistantMessage().sources().get(0).chunkIndex()).isEqualTo(2);
        assertThat(dto.assistantMessage().sources().get(0).snippet()).isEqualTo("đoạn về kế thừa");
        assertThat(dto.assistantMessage().sources().get(1).label()).isEqualTo("S1");
    }

    @Test
    void sendMessage_snippetCentersOnRelevantPartOfLongChunk() {
        loginAs(1L, "USER");
        ChatSession session = sessionOf(1L);
        session.setDocumentIds(new LinkedHashSet<>(List.of(7L)));
        when(sessionRepository.findById(5L)).thenReturn(Optional.of(session));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(embeddingService.embed(anyString())).thenReturn(new float[] {1f});
        String filler = "nội dung khác không liên quan. ".repeat(40);
        when(chunkRepository.findByDocumentIdIn(any())).thenReturn(List.of(
                new DocumentChunk(7L, 1L, "Giáo trình Sử", 0,
                        filler + "Nhà Hồ tồn tại 7 năm trong lịch sử." + filler, "[1]")));
        when(documentClient.getDocuments(any())).thenReturn(List.of());
        when(llmService.chat(anyString())).thenReturn("Nhà Hồ tồn tại 7 năm. [S1]");

        ChatAnswerDto dto = service().sendMessage(5L, "Nhà Hồ tồn tại bao lâu?");

        assertThat(dto.assistantMessage().sources().get(0).snippet())
                .contains("Nhà Hồ tồn tại 7 năm");
    }

    @Test
    void sendMessage_stripsTrailingSourceBlockButKeepsInlineCitations() {
        loginAs(1L, "USER");
        ChatSession session = sessionOf(1L);
        session.setDocumentIds(new LinkedHashSet<>(List.of(7L)));
        when(sessionRepository.findById(5L)).thenReturn(Optional.of(session));
        when(messageRepository.save(any(ChatMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(embeddingService.embed(anyString())).thenReturn(new float[] {1f});
        when(chunkRepository.findByDocumentIdIn(any())).thenReturn(List.of(
                new DocumentChunk(7L, 1L, "Giáo trình Java", 0, "nội dung", "[1]")));
        when(documentClient.getDocuments(any())).thenReturn(List.of());
        when(llmService.chat(anyString()))
                .thenReturn("Câu trả lời [S1].\n\nNguồn: [S1] Giáo trình Java (đoạn 1)");

        ChatAnswerDto dto = service().sendMessage(5L, "hỏi");

        assertThat(dto.assistantMessage().content()).isEqualTo("Câu trả lời [S1].");
        assertThat(dto.assistantMessage().sources()).hasSize(1);
    }

    @Test
    void createSession_otherUserDocument_throwsAccessDenied() {
        loginAs(2L, "USER");
        // document-service trả về tài liệu thuộc user 1 — user 2 không được gắn vào phiên
        when(documentClient.getDocument(7L)).thenReturn(docInfo(7L, 1L, "Tài liệu", null));

        assertThatThrownBy(() -> service()
                .createSession(new CreateSessionRequest(List.of(7L), "Phiên")))
                .isInstanceOf(AccessDeniedException.class);
    }
}
