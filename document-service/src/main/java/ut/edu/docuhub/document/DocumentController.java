package ut.edu.docuhub.document;

import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import ut.edu.docuhub.common.dto.ApiResponse;
import ut.edu.docuhub.common.dto.PageResponse;
import ut.edu.docuhub.document.dto.DocumentDto;
import ut.edu.docuhub.document.dto.DocumentStatsDto;
import ut.edu.docuhub.document.dto.DocumentSummaryDto;
import ut.edu.docuhub.document.dto.DocumentUpdateRequest;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentDto>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "subject", required = false) String subject) {
        DocumentDto dto = documentService.upload(file, title, description, subject);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(dto, "Upload thành công"));
    }

    @GetMapping
    public ApiResponse<PageResponse<DocumentSummaryDto>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long minSize,
            @RequestParam(required = false) Long maxSize,
            @PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.ok(
                PageResponse.from(documentService.list(q, subject, type, minSize, maxSize, pageable)));
    }

    @GetMapping("/stats")
    public ApiResponse<DocumentStatsDto> stats() {
        return ApiResponse.ok(documentService.stats());
    }

    @GetMapping("/{id}")
    public ApiResponse<DocumentDto> getById(@PathVariable Long id) {
        return ApiResponse.ok(documentService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<DocumentDto> update(@PathVariable Long id,
                                           @Valid @RequestBody DocumentUpdateRequest req) {
        return ApiResponse.ok(documentService.update(id, req), "Cập nhật thành công");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        documentService.delete(id);
        return ApiResponse.message("Đã xóa tài liệu");
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        DownloadResource data = documentService.download(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(data.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + data.filename() + "\"")
                .body(data.resource());
    }
}
