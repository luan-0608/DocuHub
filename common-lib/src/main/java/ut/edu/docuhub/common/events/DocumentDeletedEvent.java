package ut.edu.docuhub.common.events;

/** Phát bởi document-service khi xoá tài liệu; chat-service dọn chunks + gỡ khỏi phiên chat. */
public record DocumentDeletedEvent(Long documentId) {}
