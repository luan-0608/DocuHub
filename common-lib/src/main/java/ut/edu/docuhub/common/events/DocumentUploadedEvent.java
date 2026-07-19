package ut.edu.docuhub.common.events;

/**
 * Phát bởi document-service sau khi upload commit thành công;
 * chat-service consume để index RAG (extract → chunk → embedding).
 */
public record DocumentUploadedEvent(Long documentId, Long ownerId) {}
