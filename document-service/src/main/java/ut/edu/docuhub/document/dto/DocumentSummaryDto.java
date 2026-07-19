package ut.edu.docuhub.document.dto;

import java.time.LocalDateTime;
import ut.edu.docuhub.document.Document;

public record DocumentSummaryDto(
        Long id, String title, String description, String subject, String fileType,
        Long fileSize, boolean indexed, LocalDateTime createdAt) {

    public static DocumentSummaryDto from(Document d) {
        return new DocumentSummaryDto(d.getId(), d.getTitle(), d.getDescription(), d.getSubject(),
                d.getFileType(), d.getFileSize(), d.isIndexed(), d.getCreatedAt());
    }
}
