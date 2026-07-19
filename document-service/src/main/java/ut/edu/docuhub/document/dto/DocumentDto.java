package ut.edu.docuhub.document.dto;

import java.time.LocalDateTime;
import ut.edu.docuhub.document.Document;

public record DocumentDto(
        Long id, String title, String description, String subject,
        String fileType, Long fileSize, boolean indexed, String summary, LocalDateTime createdAt) {

    public static DocumentDto from(Document d) {
        return new DocumentDto(d.getId(), d.getTitle(), d.getDescription(), d.getSubject(),
                d.getFileType(), d.getFileSize(), d.isIndexed(), d.getSummary(), d.getCreatedAt());
    }
}
