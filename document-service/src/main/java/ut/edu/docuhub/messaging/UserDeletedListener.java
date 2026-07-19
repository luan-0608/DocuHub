package ut.edu.docuhub.messaging;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ut.edu.docuhub.common.events.UserDeletedEvent;
import ut.edu.docuhub.document.Document;
import ut.edu.docuhub.document.DocumentRepository;
import ut.edu.docuhub.document.StorageService;

/**
 * Khi user-service báo user bị xoá: dọn toàn bộ tài liệu + file của user đó.
 * Thay cho FK ON DELETE CASCADE thời monolith (giờ users và documents nằm ở
 * hai database khác nhau nên không thể cascade bằng khóa ngoại).
 */
@Component
public class UserDeletedListener {

    private static final Logger log = LoggerFactory.getLogger(UserDeletedListener.class);

    private final DocumentRepository documentRepository;
    private final StorageService storageService;

    public UserDeletedListener(DocumentRepository documentRepository, StorageService storageService) {
        this.documentRepository = documentRepository;
        this.storageService = storageService;
    }

    @RabbitListener(queues = DocumentAmqpConfig.USER_DELETED_QUEUE)
    @Transactional
    public void onUserDeleted(UserDeletedEvent event) {
        List<Document> docs = documentRepository.findByUserId(event.userId());
        for (Document doc : docs) {
            try {
                storageService.delete(doc.getFilePublicId());
            } catch (RuntimeException ex) {
                // File hỏng/thiếu không được chặn việc dọn bản ghi DB
                log.warn("Không xoá được file {} của tài liệu {}: {}",
                        doc.getFilePublicId(), doc.getId(), ex.getMessage());
            }
        }
        documentRepository.deleteAll(docs);
        log.info("user.deleted: đã xoá {} tài liệu của user {}", docs.size(), event.userId());
    }
}
