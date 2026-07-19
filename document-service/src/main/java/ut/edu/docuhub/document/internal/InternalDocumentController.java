package ut.edu.docuhub.document.internal;

import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ut.edu.docuhub.common.exception.ResourceNotFoundException;
import ut.edu.docuhub.common.internal.DocumentInfo;
import ut.edu.docuhub.document.Document;
import ut.edu.docuhub.document.DocumentRepository;
import ut.edu.docuhub.document.StorageService;

/**
 * API nội bộ cho chat-service (indexing/RAG): đọc metadata + nội dung file,
 * cập nhật trạng thái indexed và tóm tắt. Bảo vệ bằng X-Internal-Token,
 * gateway không định tuyến /internal/** nên không lộ ra ngoài.
 */
@RestController
@RequestMapping("/internal/documents")
public class InternalDocumentController {

    /** Body của PUT /{id}/summary — chat-service gửi JSON {"summary": "..."}. */
    public record UpdateSummaryBody(String summary) {}

    private final DocumentRepository documentRepository;
    private final StorageService storageService;

    public InternalDocumentController(DocumentRepository documentRepository,
                                      StorageService storageService) {
        this.documentRepository = documentRepository;
        this.storageService = storageService;
    }

    @GetMapping("/{id}")
    public DocumentInfo getById(@PathVariable Long id) {
        return toInfo(requireDocument(id));
    }

    @GetMapping
    public List<DocumentInfo> getByIds(@RequestParam List<Long> ids) {
        return documentRepository.findAllById(ids).stream().map(this::toInfo).toList();
    }

    @GetMapping("/unindexed")
    public List<DocumentInfo> getUnindexed() {
        return documentRepository.findByIndexedFalse().stream().map(this::toInfo).toList();
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        Document doc = requireDocument(id);
        Resource resource = storageService.loadAsResource(doc.getFilePublicId());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + doc.getFilePublicId() + "\"")
                .body(resource);
    }

    @PutMapping("/{id}/indexed")
    @Transactional
    public void markIndexed(@PathVariable Long id) {
        Document doc = requireDocument(id);
        doc.setIndexed(true);
        documentRepository.save(doc);
    }

    @PutMapping("/{id}/summary")
    @Transactional
    public void updateSummary(@PathVariable Long id, @RequestBody UpdateSummaryBody body) {
        Document doc = requireDocument(id);
        doc.setSummary(body.summary());
        documentRepository.save(doc);
    }

    private Document requireDocument(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài liệu"));
    }

    private DocumentInfo toInfo(Document d) {
        return new DocumentInfo(d.getId(), d.getUserId(), d.getTitle(), d.getSubject(),
                d.getFileType(), d.isIndexed(), d.getSummary());
    }
}
