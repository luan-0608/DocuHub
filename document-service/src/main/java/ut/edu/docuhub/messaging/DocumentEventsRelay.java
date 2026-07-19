package ut.edu.docuhub.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import ut.edu.docuhub.common.events.DocumentDeletedEvent;
import ut.edu.docuhub.common.events.DocumentUploadedEvent;
import ut.edu.docuhub.common.events.EventTopics;

/**
 * Đẩy sự kiện tài liệu sang RabbitMQ SAU khi transaction commit — giữ nguyên
 * ngữ nghĩa "chỉ index khi upload đã chắc chắn thành công" của monolith
 * (trước đây là Spring event + @TransactionalEventListener trong cùng process).
 * RabbitMQ lỗi thì chỉ log: tài liệu chưa index sẽ được job định kỳ bên
 * chat-service quét lại qua /internal/documents/unindexed.
 */
@Component
public class DocumentEventsRelay {

    private static final Logger log = LoggerFactory.getLogger(DocumentEventsRelay.class);

    private final RabbitTemplate rabbitTemplate;

    public DocumentEventsRelay(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDocumentUploaded(DocumentUploadedEvent event) {
        send(EventTopics.DOCUMENT_UPLOADED, event, event.documentId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onDocumentDeleted(DocumentDeletedEvent event) {
        send(EventTopics.DOCUMENT_DELETED, event, event.documentId());
    }

    private void send(String routingKey, Object event, Long documentId) {
        try {
            rabbitTemplate.convertAndSend(EventTopics.EXCHANGE, routingKey, event);
            log.info("Đã phát sự kiện {} cho tài liệu {}", routingKey, documentId);
        } catch (RuntimeException ex) {
            log.error("Không phát được sự kiện {} cho tài liệu {}: {}",
                    routingKey, documentId, ex.getMessage());
        }
    }
}
