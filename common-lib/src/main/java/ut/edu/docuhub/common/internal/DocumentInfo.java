package ut.edu.docuhub.common.internal;

/**
 * Hợp đồng dữ liệu (service contract) cho API nội bộ /internal/documents
 * của document-service — chat-service gọi qua Feign để lấy thông tin tài liệu
 * (chủ sở hữu, tiêu đề, loại file, tóm tắt) phục vụ indexing và RAG.
 */
public record DocumentInfo(
        Long id,
        Long ownerId,
        String title,
        String subject,
        String fileType,
        boolean indexed,
        String summary) {}
