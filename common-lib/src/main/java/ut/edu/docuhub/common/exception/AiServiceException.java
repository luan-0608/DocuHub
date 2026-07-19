package ut.edu.docuhub.common.exception;

/**
 * Lỗi khi gọi dịch vụ AI bên ngoài (embedding / chat LLM): chưa cấu hình key,
 * không kết nối được, key bị từ chối... Message viết cho người dùng cuối đọc,
 * GlobalExceptionHandler trả về 503 kèm nguyên văn message.
 */
public class AiServiceException extends RuntimeException {

    public AiServiceException(String message) {
        super(message);
    }

    public AiServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
