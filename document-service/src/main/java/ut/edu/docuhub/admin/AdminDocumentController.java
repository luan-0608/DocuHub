package ut.edu.docuhub.admin;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ut.edu.docuhub.common.dto.ApiResponse;
import ut.edu.docuhub.common.dto.PageResponse;
import ut.edu.docuhub.document.dto.DocumentSummaryDto;

@RestController
@RequestMapping("/api/admin/documents")
public class AdminDocumentController {

    private final AdminDocumentService adminDocumentService;

    public AdminDocumentController(AdminDocumentService adminDocumentService) {
        this.adminDocumentService = adminDocumentService;
    }

    @GetMapping
    public ApiResponse<PageResponse<DocumentSummaryDto>> listDocuments(
            @PageableDefault(size = 10) Pageable pageable) {
        return ApiResponse.ok(PageResponse.from(adminDocumentService.listDocuments(pageable)));
    }
}
