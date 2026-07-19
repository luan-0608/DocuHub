package ut.edu.docuhub.chat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Đoạn văn bản đã vector hóa cho RAG. documentId là ID bên document-service.
 * ownerId + documentTitle được denormalize (chép kèm) lúc index để chat-service
 * truy xuất và gắn nhãn nguồn [S#] mà KHÔNG phải gọi document-service mỗi câu hỏi
 * (thời monolith lấy qua @ManyToOne Document).
 */
@Entity
@Table(name = "document_chunks")
public class DocumentChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "document_id", nullable = false)
    private Long documentId;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "document_title", nullable = false)
    private String documentTitle;

    @Column(name = "chunk_index", nullable = false)
    private int chunkIndex;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String embedding;

    public DocumentChunk() {
    }

    public DocumentChunk(Long documentId, Long ownerId, String documentTitle,
                         int chunkIndex, String content, String embedding) {
        this.documentId = documentId;
        this.ownerId = ownerId;
        this.documentTitle = documentTitle;
        this.chunkIndex = chunkIndex;
        this.content = content;
        this.embedding = embedding;
    }

    public Long getId() { return id; }

    public Long getDocumentId() { return documentId; }

    public Long getOwnerId() { return ownerId; }

    public String getDocumentTitle() { return documentTitle; }

    public int getChunkIndex() { return chunkIndex; }

    public String getContent() { return content; }

    public String getEmbedding() { return embedding; }
}
