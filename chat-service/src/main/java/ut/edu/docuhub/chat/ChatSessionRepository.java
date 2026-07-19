package ut.edu.docuhub.chat;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Gỡ tài liệu đã xóa khỏi mọi phiên chat. JPQL không xóa được bản ghi của
     * @ElementCollection nên dùng native query thẳng vào bảng phụ.
     */
    @Modifying
    @Query(value = "DELETE FROM chat_session_documents WHERE document_id = :documentId",
            nativeQuery = true)
    void removeDocumentFromAllSessions(@Param("documentId") Long documentId);
}
