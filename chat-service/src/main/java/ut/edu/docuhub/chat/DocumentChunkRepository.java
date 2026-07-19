package ut.edu.docuhub.chat;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    /** Chunk theo đúng thứ tự trong tài liệu — dùng để ghép lại toàn văn khi tóm tắt. */
    List<DocumentChunk> findByDocumentIdOrderByChunkIndexAsc(Long documentId);

    List<DocumentChunk> findByDocumentIdIn(List<Long> documentIds);

    /** Phiên "hỏi tất cả" (0 tài liệu): lấy mọi chunk của user qua owner_id denormalize. */
    List<DocumentChunk> findByOwnerId(Long ownerId);

    // @Transactional để gọi được từ ngoài transaction (job re-index của IndexingService)
    @Transactional
    void deleteByDocumentId(Long documentId);

    @Transactional
    void deleteByOwnerId(Long ownerId);
}
