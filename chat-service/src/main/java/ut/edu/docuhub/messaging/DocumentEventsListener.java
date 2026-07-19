package ut.edu.docuhub.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.docuhub.chat.ChatSessionRepository;
import ut.edu.docuhub.chat.DocumentChunkRepository;
import ut.edu.docuhub.chat.IndexingService;
import ut.edu.docuhub.common.events.DocumentDeletedEvent;
import ut.edu.docuhub.common.events.DocumentUploadedEvent;

/** Phản ứng với vòng đời tài liệu bên document-service (qua RabbitMQ). */
@Component
public class DocumentEventsListener {

    private static final Logger log = LoggerFactory.getLogger(DocumentEventsListener.class);

    private final IndexingService indexingService;
    private final DocumentChunkRepository chunkRepository;
    private final ChatSessionRepository sessionRepository;

    public DocumentEventsListener(IndexingService indexingService,
                                  DocumentChunkRepository chunkRepository,
                                  ChatSessionRepository sessionRepository) {
        this.indexingService = indexingService;
        this.chunkRepository = chunkRepository;
        this.sessionRepository = sessionRepository;
    }

    @RabbitListener(queues = ChatAmqpConfig.DOCUMENT_UPLOADED_QUEUE)
    public void onDocumentUploaded(DocumentUploadedEvent event) {
        try {
            indexingService.index(event.documentId());
        } catch (Exception e) {
            // Nuốt lỗi để message không bị đẩy đi đẩy lại — job retryUnindexed sẽ quét lại sau
            log.error("Index thất bại cho document {}: {}", event.documentId(), e.getMessage(), e);
        }
    }

    @RabbitListener(queues = ChatAmqpConfig.DOCUMENT_DELETED_QUEUE)
    @Transactional
    public void onDocumentDeleted(DocumentDeletedEvent event) {
        // Thời monolith chunk bị xóa theo FK cascade; giờ chat-service tự dọn
        chunkRepository.deleteByDocumentId(event.documentId());
        sessionRepository.removeDocumentFromAllSessions(event.documentId());
        log.info("document.deleted: đã dọn chunk và gỡ tài liệu {} khỏi các phiên chat",
                event.documentId());
    }
}
