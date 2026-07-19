package ut.edu.docuhub.chat;

import feign.FeignException;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import ut.edu.docuhub.client.DocumentClient;
import ut.edu.docuhub.common.exception.AiServiceException;
import ut.edu.docuhub.common.internal.DocumentInfo;

/**
 * Index tài liệu cho RAG: tải file từ document-service → cắt chunk → embedding
 * → lưu document_chunks (kèm owner_id + document_title denormalize).
 * Kích hoạt qua sự kiện document.uploaded trên RabbitMQ (DocumentEventsListener) —
 * thời monolith là Spring event AFTER_COMMIT + @Async trong cùng process.
 */
@Service
public class IndexingService {

    private static final Logger log = LoggerFactory.getLogger(IndexingService.class);

    private final DocumentClient documentClient;
    private final DocumentChunkRepository chunkRepository;
    private final TextExtractor textExtractor;
    private final EmbeddingService embeddingService;
    private final int chunkSize;
    private final int chunkOverlap;

    public IndexingService(DocumentClient documentClient,
                           DocumentChunkRepository chunkRepository,
                           TextExtractor textExtractor,
                           EmbeddingService embeddingService,
                           @Value("${rag.chunk-size}") int chunkSize,
                           @Value("${rag.chunk-overlap}") int chunkOverlap) {
        this.documentClient = documentClient;
        this.chunkRepository = chunkRepository;
        this.textExtractor = textExtractor;
        this.embeddingService = embeddingService;
        this.chunkSize = chunkSize;
        this.chunkOverlap = chunkOverlap;
    }

    /**
     * Tự index lại các tài liệu còn "Chờ xử lý" (upload đúng lúc API embedding lỗi,
     * RabbitMQ rớt message hoặc chat-service đang tắt) — người dùng không phải xóa
     * tải lại, hạ tầng sống lại là vài phút sau tài liệu tự sẵn sàng.
     * Chạy sau khi khởi động 20 giây, lặp mỗi 5 phút.
     */
    @Scheduled(initialDelay = 20_000, fixedDelay = 300_000)
    public void retryUnindexed() {
        List<DocumentInfo> pending;
        try {
            pending = documentClient.getUnindexed();
        } catch (RuntimeException e) {
            // document-service chưa lên hoặc chưa đăng ký Eureka — chờ lượt quét sau
            log.warn("Chưa lấy được danh sách tài liệu chờ index: {}", e.getMessage());
            return;
        }
        if (pending.isEmpty()) {
            return;
        }
        log.info("Thử index lại {} tài liệu đang chờ xử lý", pending.size());
        for (DocumentInfo doc : pending) {
            try {
                index(doc.id());
            } catch (AiServiceException e) {
                // API AI vẫn chưa hoạt động — các tài liệu còn lại cũng sẽ lỗi, chờ lượt quét sau
                log.warn("Index lại chưa thành công (document {}): {}", doc.id(), e.getMessage());
                return;
            } catch (Exception e) {
                // Lỗi riêng của tài liệu này (mất file, đọc không được...) — vẫn thử các tài liệu khác
                log.error("Index lại thất bại cho document {}: {}", doc.id(), e.getMessage(), e);
            }
        }
    }

    @Transactional
    public void index(Long documentId) {
        DocumentInfo doc;
        try {
            doc = documentClient.getDocument(documentId);
        } catch (FeignException.NotFound e) {
            return; // tài liệu đã bị xóa trong lúc chờ index
        }
        byte[] data = documentClient.downloadFile(documentId);
        String text = textExtractor.extract(new ByteArrayResource(data), doc.fileType());
        if (!StringUtils.hasText(text)) {
            log.warn("Không trích được text từ document {} (type={})", documentId, doc.fileType());
            return;
        }

        // Xóa chunk cũ nếu lần index trước gãy giữa chừng — tránh trùng lặp khi index lại
        chunkRepository.deleteByDocumentId(documentId);
        List<String> chunks = chunk(text);
        for (int i = 0; i < chunks.size(); i++) {
            float[] vector = embeddingService.embed(chunks.get(i));
            chunkRepository.save(new DocumentChunk(documentId, doc.ownerId(), doc.title(),
                    i, chunks.get(i), embeddingService.toJson(vector)));
        }
        // Báo document-service đánh dấu indexed=true; nếu lệnh này lỗi thì chunk vẫn còn
        // và job retryUnindexed sẽ index lại từ đầu (deleteByDocumentId ở trên) — idempotent
        documentClient.markIndexed(documentId);
        log.info("Đã index document {} thành {} chunk", documentId, chunks.size());
    }

    /** Cắt theo cửa sổ trượt ~chunkSize ký tự, overlap chunkOverlap (KISS). */
    private List<String> chunk(String text) {
        List<String> result = new ArrayList<>();
        int step = Math.max(1, chunkSize - chunkOverlap);
        for (int start = 0; start < text.length(); start += step) {
            int end = Math.min(text.length(), start + chunkSize);
            String piece = text.substring(start, end).trim();
            if (!piece.isEmpty()) {
                result.add(piece);
            }
            if (end == text.length()) {
                break;
            }
        }
        return result;
    }
}
