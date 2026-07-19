package ut.edu.docuhub.document;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    /** Tài liệu chưa index xong (upload lúc API embedding lỗi) — để job định kỳ thử lại. */
    List<Document> findByIndexedFalse();

    /** Toàn bộ tài liệu của một user — dùng khi dọn dữ liệu lúc nhận user.deleted. */
    List<Document> findByUserId(Long userId);

    @Query("""
            SELECT d FROM Document d
            WHERE d.userId = :userId
              AND (:q IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :q, '%'))
                              OR LOWER(d.description) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:subject IS NULL OR d.subject = :subject)
              AND (:untagged = false OR d.subject IS NULL)
              AND (:typed = false OR d.fileType IN :fileTypes)
              AND (:minSize IS NULL OR d.fileSize >= :minSize)
              AND (:maxSize IS NULL OR d.fileSize <= :maxSize)
            """)
    Page<Document> search(@Param("userId") Long userId,
                          @Param("q") String q,
                          @Param("subject") String subject,
                          @Param("untagged") boolean untagged,
                          @Param("typed") boolean typed,
                          @Param("fileTypes") List<String> fileTypes,
                          @Param("minSize") Long minSize,
                          @Param("maxSize") Long maxSize,
                          Pageable pageable);

    @Query("""
            SELECT d.subject, COUNT(d) FROM Document d
            WHERE d.userId = :userId
            GROUP BY d.subject
            ORDER BY COUNT(d) DESC
            """)
    List<Object[]> countBySubject(@Param("userId") Long userId);

    @Query("SELECT COUNT(d), COALESCE(SUM(d.fileSize), 0) FROM Document d WHERE d.userId = :userId")
    Object[] totalsByUser(@Param("userId") Long userId);
}
