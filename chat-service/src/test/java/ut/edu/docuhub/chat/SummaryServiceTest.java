package ut.edu.docuhub.chat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import ut.edu.docuhub.client.DocumentClient;
import ut.edu.docuhub.client.UpdateSummaryRequest;
import ut.edu.docuhub.common.internal.DocumentInfo;
import ut.edu.docuhub.common.security.AuthPrincipal;

@ExtendWith(MockitoExtension.class)
class SummaryServiceTest {

    @Mock DocumentClient documentClient;
    @Mock DocumentChunkRepository chunkRepository;
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

    private SummaryService service() {
        return new SummaryService(documentClient, chunkRepository, llmService);
    }

    private DocumentInfo ownedDoc(long ownerId) {
        return new DocumentInfo(7L, ownerId, "Tài liệu", "Môn học", "pdf", true, null);
    }

    private DocumentChunk chunk(int index, String content) {
        return new DocumentChunk(7L, 1L, "Tài liệu", index, content, "[0.1]");
    }

    @Test
    void summarize_shortDocument_singleLlmCallAndSentToDocumentService() {
        loginAs(1L, "USER");
        when(documentClient.getDocument(7L)).thenReturn(ownedDoc(1L));
        when(chunkRepository.findByDocumentIdOrderByChunkIndexAsc(7L))
                .thenReturn(List.of(chunk(0, "Nội dung ngắn")));
        when(llmService.chat(anyString())).thenReturn("- Ý chính");

        String summary = service().summarize(7L);

        assertThat(summary).isEqualTo("- Ý chính");
        verify(llmService, times(1)).chat(contains("Nội dung ngắn"));
        // Tóm tắt phải được đẩy về document-service lưu (summary nằm ở DB bên đó)
        verify(documentClient).updateSummary(7L, new UpdateSummaryRequest("- Ý chính"));
    }

    @Test
    void summarize_longDocument_mapReduceOverParts() {
        loginAs(1L, "USER");
        // 2 chunk 8k → tổng ~16k ký tự, vượt ngưỡng 15k của 1 lần gọi → 2 phần + 1 lần gộp
        String big = "x".repeat(8_000);
        when(documentClient.getDocument(7L)).thenReturn(ownedDoc(1L));
        when(chunkRepository.findByDocumentIdOrderByChunkIndexAsc(7L))
                .thenReturn(List.of(chunk(0, big), chunk(1, big)));
        when(llmService.chat(anyString())).thenReturn("- tóm tắt");

        service().summarize(7L);

        // 2 phần + 1 gộp = 3 lần gọi LLM
        verify(llmService, times(3)).chat(anyString());
        verify(documentClient).updateSummary(7L, new UpdateSummaryRequest("- tóm tắt"));
    }

    @Test
    void summarize_notIndexedYet_throwsWithClearMessage() {
        loginAs(1L, "USER");
        when(documentClient.getDocument(7L)).thenReturn(ownedDoc(1L));
        when(chunkRepository.findByDocumentIdOrderByChunkIndexAsc(7L)).thenReturn(List.of());

        assertThatThrownBy(() -> service().summarize(7L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("chưa được lập chỉ mục");
        verify(llmService, never()).chat(anyString());
        verify(documentClient, never()).updateSummary(anyLong(), any());
    }

    @Test
    void summarize_otherUserDocument_throwsAccessDenied() {
        loginAs(2L, "USER");
        when(documentClient.getDocument(7L)).thenReturn(ownedDoc(1L));

        assertThatThrownBy(() -> service().summarize(7L))
                .isInstanceOf(AccessDeniedException.class);
        verify(llmService, never()).chat(anyString());
    }
}
