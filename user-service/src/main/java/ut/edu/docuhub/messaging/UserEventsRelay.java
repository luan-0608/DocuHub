package ut.edu.docuhub.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import ut.edu.docuhub.common.events.EventTopics;
import ut.edu.docuhub.common.events.UserDeletedEvent;

/**
 * Đẩy sự kiện nghiệp vụ sang RabbitMQ SAU khi transaction DB commit thành công
 * — tránh phát sự kiện cho một thao tác cuối cùng bị rollback.
 * Nếu RabbitMQ lỗi tại thời điểm này thì chỉ log (user đã xoá xong trong DB);
 * dữ liệu mồ côi ở service khác chấp nhận được với phạm vi đồ án.
 */
@Component
public class UserEventsRelay {

    private static final Logger log = LoggerFactory.getLogger(UserEventsRelay.class);

    private final RabbitTemplate rabbitTemplate;

    public UserEventsRelay(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onUserDeleted(UserDeletedEvent event) {
        try {
            rabbitTemplate.convertAndSend(EventTopics.EXCHANGE, EventTopics.USER_DELETED, event);
            log.info("Đã phát sự kiện {} cho user {}", EventTopics.USER_DELETED, event.userId());
        } catch (RuntimeException ex) {
            log.error("Không phát được sự kiện {} cho user {}: {}",
                    EventTopics.USER_DELETED, event.userId(), ex.getMessage());
        }
    }
}
