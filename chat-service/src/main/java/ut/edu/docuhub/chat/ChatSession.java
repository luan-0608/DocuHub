package ut.edu.docuhub.chat;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Phiên chat. userId và documentIds là ID bên user-service/document-service —
 * chỉ lưu số, không có quan hệ JPA vì dữ liệu nằm ở database khác
 * (thời monolith là @ManyToOne User + @ManyToMany Document).
 */
@Entity
@Table(name = "chat_sessions")
public class ChatSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "chat_session_documents",
            joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "document_id")
    private Set<Long> documentIds = new LinkedHashSet<>();

    private String title;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Set<Long> getDocumentIds() { return documentIds; }
    public void setDocumentIds(Set<Long> documentIds) { this.documentIds = documentIds; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}
