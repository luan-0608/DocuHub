package ut.edu.docuhub.messaging;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.docuhub.chat.ChatSession;
import ut.edu.docuhub.chat.ChatSessionRepository;
import ut.edu.docuhub.chat.DocumentChunkRepository;
import ut.edu.docuhub.common.events.UserDeletedEvent;

/**
 * Khi user-service báo user bị xoá: dọn chunk (theo owner_id denormalize)
 * và phiên chat + tin nhắn của user đó. Thay cho FK ON DELETE CASCADE
 * thời monolith — giờ users nằm ở database khác.
 */
@Component
public class UserDeletedListener {

    private static final Logger log = LoggerFactory.getLogger(UserDeletedListener.class);

    private final DocumentChunkRepository chunkRepository;
    private final ChatSessionRepository sessionRepository;

    public UserDeletedListener(DocumentChunkRepository chunkRepository,
                               ChatSessionRepository sessionRepository) {
        this.chunkRepository = chunkRepository;
        this.sessionRepository = sessionRepository;
    }

    @RabbitListener(queues = ChatAmqpConfig.USER_DELETED_QUEUE)
    @Transactional
    public void onUserDeleted(UserDeletedEvent event) {
        chunkRepository.deleteByOwnerId(event.userId());
        List<ChatSession> sessions = sessionRepository.findByUserIdOrderByCreatedAtDesc(event.userId());
        // Tin nhắn xóa theo FK ON DELETE CASCADE, documentIds theo element collection
        sessionRepository.deleteAll(sessions);
        log.info("user.deleted: đã xoá {} phiên chat và toàn bộ chunk của user {}",
                sessions.size(), event.userId());
    }
}
