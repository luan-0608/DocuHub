package ut.edu.docuhub.chat;

import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import ut.edu.docuhub.common.exception.AiServiceException;

/**
 * Dịch lỗi kỹ thuật khi gọi API AI (embedding / LLM) thành thông điệp mà
 * người dùng và người vận hành đọc hiểu được ngay, kèm gợi ý cấu hình cần xem.
 */
final class AiErrors {

    private AiErrors() {}

    /** Ném AiServiceException nếu API key chưa được cấu hình. */
    static void requireApiKey(String apiKey, String service, String configHint) {
        if (!StringUtils.hasText(apiKey)) {
            throw new AiServiceException(
                    "Chưa cấu hình API key cho " + service + " — kiểm tra " + configHint);
        }
    }

    static AiServiceException translate(String service, String configHint, RestClientException e) {
        if (e instanceof ResourceAccessException) {
            return new AiServiceException(
                    service + " không phản hồi — máy chủ AI mất kết nối, quá chậm hoặc sai địa chỉ ("
                            + configHint + ")", e);
        }
        if (e instanceof HttpStatusCodeException http) {
            int status = http.getStatusCode().value();
            return switch (status) {
                case 401, 403 -> new AiServiceException(
                        service + " từ chối API key (HTTP " + status + ") — kiểm tra " + configHint, e);
                case 404 -> new AiServiceException(
                        service + " báo không tìm thấy endpoint hoặc model (HTTP 404) — kiểm tra "
                                + configHint, e);
                case 429 -> new AiServiceException(
                        service + " đang quá tải hoặc hết hạn mức (HTTP 429) — thử lại sau ít phút", e);
                default -> new AiServiceException(
                        service + " trả về lỗi HTTP " + status + " — thử lại sau", e);
            };
        }
        return new AiServiceException(service + " gặp lỗi không xác định: " + e.getMessage(), e);
    }
}
