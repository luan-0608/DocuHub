package ut.edu.docuhub.chat;

import feign.FeignException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.docuhub.client.DocumentClient;
import ut.edu.docuhub.client.UpdateSummaryRequest;
import ut.edu.docuhub.common.exception.ResourceNotFoundException;
import ut.edu.docuhub.common.internal.DocumentInfo;
import ut.edu.docuhub.common.security.CurrentUser;

/**
 * Tóm tắt tài liệu bằng AI, tái dùng chunk đã index (không đọc lại file).
 * Tài liệu ngắn: 1 lần gọi LLM. Tài liệu dài: tóm tắt từng phần rồi gộp
 * (map-reduce) để không vượt giới hạn ngữ cảnh của model.
 * Kết quả gửi về document-service lưu vào documents.summary — sinh 1 lần,
 * xem lại không tốn API.
 */
@Service
public class SummaryService {

    // ~15k ký tự (~4-5k token) mỗi lần gọi là an toàn với đa số model
    private static final int SINGLE_CALL_LIMIT = 15_000;
    private static final int PART_SIZE = 15_000;
    // Chặn tài liệu cực dài để không đốt hạn mức API: 8 phần ~ 120k ký tự đầu
    private static final int MAX_PARTS = 8;

    private static final String SUMMARY_PROMPT = """
            Bạn là trợ lý học tập. Tóm tắt tài liệu dưới đây bằng tiếng Việt cho sinh viên ôn tập.
            Trình bày dạng văn bản thuần (không markdown), theo cấu trúc:
            - Mở đầu 1-2 câu nêu chủ đề tài liệu.
            - Các ý chính, mỗi ý một dòng bắt đầu bằng "- ".
            - Cuối cùng dòng "Khái niệm cần nhớ:" liệt kê thuật ngữ/định nghĩa quan trọng (nếu có).

            TÀI LIỆU:
            %s""";

    private static final String PART_PROMPT = """
            Bạn là trợ lý học tập. Đây là PHẦN %d/%d của một tài liệu dài.
            Tóm tắt ngắn gọn các ý chính của phần này bằng tiếng Việt, mỗi ý một dòng bắt đầu bằng "- ".

            NỘI DUNG PHẦN:
            %s""";

    private static final String MERGE_PROMPT = """
            Bạn là trợ lý học tập. Dưới đây là tóm tắt từng phần của cùng một tài liệu.
            Gộp thành MỘT bản tóm tắt hoàn chỉnh bằng tiếng Việt cho sinh viên ôn tập, bỏ ý trùng lặp.
            Trình bày dạng văn bản thuần (không markdown), theo cấu trúc:
            - Mở đầu 1-2 câu nêu chủ đề tài liệu.
            - Các ý chính, mỗi ý một dòng bắt đầu bằng "- ".
            - Cuối cùng dòng "Khái niệm cần nhớ:" liệt kê thuật ngữ/định nghĩa quan trọng (nếu có).

            TÓM TẮT TỪNG PHẦN:
            %s""";

    private final DocumentClient documentClient;
    private final DocumentChunkRepository chunkRepository;
    private final LlmService llmService;

    public SummaryService(DocumentClient documentClient,
                          DocumentChunkRepository chunkRepository,
                          LlmService llmService) {
        this.documentClient = documentClient;
        this.chunkRepository = chunkRepository;
        this.llmService = llmService;
    }

    @Transactional(readOnly = true)
    public String summarize(Long documentId) {
        requireOwnedDocument(documentId);
        List<DocumentChunk> chunks = chunkRepository.findByDocumentIdOrderByChunkIndexAsc(documentId);
        if (chunks.isEmpty()) {
            throw new IllegalArgumentException(
                    "Tài liệu chưa được lập chỉ mục xong — đợi vài phút rồi thử lại");
        }
        String fullText = chunks.stream()
                .map(DocumentChunk::getContent)
                .reduce((a, b) -> a + "\n" + b)
                .orElse("");

        String summary = fullText.length() <= SINGLE_CALL_LIMIT
                ? llmService.chat(SUMMARY_PROMPT.formatted(fullText))
                : summarizeLong(fullText);

        documentClient.updateSummary(documentId, new UpdateSummaryRequest(summary));
        return summary;
    }

    private String summarizeLong(String fullText) {
        List<String> parts = splitParts(fullText);
        boolean truncated = parts.size() > MAX_PARTS;
        if (truncated) {
            parts = parts.subList(0, MAX_PARTS);
        }
        List<String> partSummaries = new ArrayList<>();
        for (int i = 0; i < parts.size(); i++) {
            partSummaries.add(
                    llmService.chat(PART_PROMPT.formatted(i + 1, parts.size(), parts.get(i))));
        }
        String merged = llmService.chat(MERGE_PROMPT.formatted(String.join("\n\n", partSummaries)));
        return truncated
                ? merged + "\n\n(Tài liệu rất dài — bản tóm tắt dựa trên phần đầu của tài liệu.)"
                : merged;
    }

    private List<String> splitParts(String text) {
        List<String> parts = new ArrayList<>();
        for (int start = 0; start < text.length(); start += PART_SIZE) {
            parts.add(text.substring(start, Math.min(text.length(), start + PART_SIZE)));
        }
        return parts;
    }

    private DocumentInfo requireOwnedDocument(Long documentId) {
        DocumentInfo doc;
        try {
            doc = documentClient.getDocument(documentId);
        } catch (FeignException.NotFound e) {
            throw new ResourceNotFoundException("Không tìm thấy tài liệu");
        }
        if (!doc.ownerId().equals(CurrentUser.id())) {
            throw new AccessDeniedException("Bạn không có quyền với tài liệu này");
        }
        return doc;
    }
}
