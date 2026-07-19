package ut.edu.docuhub.document;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import ut.edu.docuhub.common.events.DocumentDeletedEvent;
import ut.edu.docuhub.common.events.DocumentUploadedEvent;
import ut.edu.docuhub.common.security.AuthPrincipal;
import ut.edu.docuhub.document.dto.DocumentDto;

@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @Mock DocumentRepository documentRepository;
    @Mock StorageService storageService;
    @Mock org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks DocumentService documentService;

    @AfterEach
    void clearContext() {
        SecurityContextHolder.clearContext();
    }

    /** Monolith lấy user qua UserService; giờ service đọc AuthPrincipal từ SecurityContext. */
    private void loginAs(long id, String role) {
        AuthPrincipal principal = new AuthPrincipal(id, "user" + id + "@docuhub.vn", role);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))));
    }

    @Test
    void upload_savesDocumentNotIndexed() {
        var file = new MockMultipartFile("file", "note.pdf", "application/pdf", "data".getBytes());
        loginAs(1L, "USER");
        when(storageService.upload(any())).thenReturn(new UploadResult("k.pdf", "k.pdf", "pdf", 4));
        when(documentRepository.save(any(Document.class))).thenAnswer(inv -> inv.getArgument(0));

        DocumentDto dto = documentService.upload(file, "Note", "desc", "Toán");

        assertThat(dto.title()).isEqualTo("Note");
        assertThat(dto.indexed()).isFalse();
        verify(storageService).upload(file);
        verify(eventPublisher).publishEvent(any(DocumentUploadedEvent.class));
    }

    @Test
    void getById_otherUserDocument_throwsAccessDenied() {
        Document doc = new Document();
        doc.setUserId(1L);
        when(documentRepository.findById(10L)).thenReturn(Optional.of(doc));
        loginAs(2L, "USER");

        assertThatThrownBy(() -> documentService.getById(10L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void delete_removesFileThenRecordAndPublishesEvent() {
        Document doc = new Document();
        doc.setUserId(1L);
        doc.setFilePublicId("k.pdf");
        when(documentRepository.findById(10L)).thenReturn(Optional.of(doc));
        loginAs(1L, "USER");

        documentService.delete(10L);

        verify(storageService).delete("k.pdf");
        verify(documentRepository).delete(doc);
        verify(eventPublisher).publishEvent(any(DocumentDeletedEvent.class));
    }
}
