package ut.edu.docuhub.document;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import ut.edu.docuhub.common.events.DocumentDeletedEvent;
import ut.edu.docuhub.common.events.DocumentUploadedEvent;
import ut.edu.docuhub.common.exception.ResourceNotFoundException;
import ut.edu.docuhub.common.security.AuthPrincipal;
import ut.edu.docuhub.common.security.CurrentUser;
import ut.edu.docuhub.document.dto.DocumentDto;
import ut.edu.docuhub.document.dto.DocumentStatsDto;
import ut.edu.docuhub.document.dto.DocumentSummaryDto;
import ut.edu.docuhub.document.dto.DocumentUpdateRequest;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final StorageService storageService;
    private final ApplicationEventPublisher eventPublisher;

    public DocumentService(DocumentRepository documentRepository, StorageService storageService,
                           ApplicationEventPublisher eventPublisher) {
        this.documentRepository = documentRepository;
        this.storageService = storageService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public DocumentDto upload(MultipartFile file, String title, String description, String subject) {
        if (!StringUtils.hasText(title)) {
            throw new IllegalArgumentException("Tiêu đề không được để trống");
        }
        UploadResult result = storageService.upload(file);

        Document doc = new Document();
        doc.setUserId(CurrentUser.id());
        doc.setTitle(title);
        doc.setDescription(description);
        doc.setSubject(normalizeSubject(subject));
        doc.setFileUrl(result.url());
        doc.setFilePublicId(result.publicId());
        doc.setFileType(result.type());
        doc.setFileSize(result.size());
        doc.setIndexed(false);
        Document saved = documentRepository.save(doc);
        // Sự kiện Spring nội bộ; DocumentEventsRelay đẩy sang RabbitMQ SAU khi commit
        eventPublisher.publishEvent(new DocumentUploadedEvent(saved.getId(), saved.getUserId()));
        return DocumentDto.from(saved);
    }

    /** Giá trị đặc biệt từ frontend để lọc tài liệu chưa gắn môn học. */
    public static final String UNTAGGED_SUBJECT = "__untagged__";

    /** Nhóm định dạng cho bộ lọc: một lựa chọn trên UI có thể gồm nhiều đuôi file. */
    private static final Map<String, List<String>> TYPE_GROUPS = Map.of(
            "pdf", List.of("pdf"),
            "word", List.of("doc", "docx"),
            "ppt", List.of("ppt", "pptx"),
            "txt", List.of("txt"));

    @Transactional(readOnly = true)
    public Page<DocumentSummaryDto> list(String q, String subject, String type,
                                         Long minSize, Long maxSize, Pageable pageable) {
        Long userId = CurrentUser.id();
        String normalizedQ = StringUtils.hasText(q) ? q : null;
        boolean untagged = UNTAGGED_SUBJECT.equals(subject);
        String normalizedSubject = !untagged && StringUtils.hasText(subject) ? subject : null;
        // Nhóm không nhận diện được coi như không lọc; IN cần list khác rỗng nên truyền placeholder
        List<String> fileTypes = StringUtils.hasText(type)
                ? TYPE_GROUPS.get(type.toLowerCase(Locale.ROOT)) : null;
        boolean typed = fileTypes != null;
        return documentRepository
                .search(userId, normalizedQ, normalizedSubject, untagged,
                        typed, typed ? fileTypes : List.of(""), minSize, maxSize, pageable)
                .map(DocumentSummaryDto::from);
    }

    @Transactional(readOnly = true)
    public DocumentStatsDto stats() {
        Long userId = CurrentUser.id();
        Object[] totals = documentRepository.totalsByUser(userId);
        // JPQL aggregate trả về mảng lồng khi query có nhiều cột
        Object[] row = totals.length > 0 && totals[0] instanceof Object[] ? (Object[]) totals[0] : totals;
        long totalDocuments = ((Number) row[0]).longValue();
        long totalSize = ((Number) row[1]).longValue();
        List<DocumentStatsDto.SubjectCount> subjects = documentRepository.countBySubject(userId).stream()
                .map(r -> new DocumentStatsDto.SubjectCount(
                        r[0] != null ? (String) r[0] : null,
                        ((Number) r[1]).longValue()))
                .toList();
        return new DocumentStatsDto(totalDocuments, totalSize, subjects);
    }

    @Transactional(readOnly = true)
    public DocumentDto getById(Long id) {
        return DocumentDto.from(getOwned(id));
    }

    @Transactional
    public DocumentDto update(Long id, DocumentUpdateRequest req) {
        Document doc = getOwned(id);
        doc.setTitle(req.title());
        doc.setDescription(req.description());
        doc.setSubject(normalizeSubject(req.subject()));
        return DocumentDto.from(documentRepository.save(doc));
    }

    @Transactional
    public void delete(Long id) {
        Document doc = getOwned(id);
        storageService.delete(doc.getFilePublicId());
        documentRepository.delete(doc);
        // Thời monolith chunks bị xoá theo FK cascade; giờ chat-service tự dọn khi nhận sự kiện
        eventPublisher.publishEvent(new DocumentDeletedEvent(doc.getId()));
    }

    @Transactional(readOnly = true)
    public DownloadResource download(Long id) {
        Document doc = getOwned(id);
        String filename = "doc-" + doc.getId() + "." + doc.getFileType();
        return new DownloadResource(storageService.loadAsResource(doc.getFilePublicId()),
                filename, "application/octet-stream");
    }

    /**
     * Chuẩn hóa tên môn học để tránh sinh "thư mục" trùng do gõ lệch:
     * cắt khoảng trắng thừa, gộp nhiều dấu cách, viết hoa chữ cái đầu.
     */
    private String normalizeSubject(String subject) {
        if (!StringUtils.hasText(subject)) {
            return null;
        }
        String cleaned = subject.trim().replaceAll("\\s+", " ");
        return Character.toUpperCase(cleaned.charAt(0)) + cleaned.substring(1);
    }

    private Document getOwned(Long id) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài liệu"));
        AuthPrincipal current = CurrentUser.get();
        if (!doc.getUserId().equals(current.id()) && !current.isAdmin()) {
            throw new AccessDeniedException("Bạn không có quyền với tài liệu này");
        }
        return doc;
    }
}
