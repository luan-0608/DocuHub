package ut.edu.docuhub.chat;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ut.edu.docuhub.common.dto.ApiResponse;

/**
 * Endpoint tóm tắt tài liệu bằng AI. Đặt ở package chat vì phụ thuộc LlmService,
 * URL vẫn theo tài nguyên documents cho nhất quán với frontend.
 */
@RestController
@RequestMapping("/api/documents")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    @PostMapping("/{id}/summary")
    public ApiResponse<String> summarize(@PathVariable Long id) {
        return ApiResponse.ok(summaryService.summarize(id), "Đã tạo tóm tắt");
    }
}
