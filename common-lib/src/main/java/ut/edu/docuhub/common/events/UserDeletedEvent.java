package ut.edu.docuhub.common.events;

/**
 * Phát bởi user-service khi admin xoá người dùng. Thay cho FK ON DELETE CASCADE
 * thời monolith: document-service xoá tài liệu + file, chat-service xoá phiên chat.
 */
public record UserDeletedEvent(Long userId) {}
