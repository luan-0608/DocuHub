package ut.edu.docuhub.chat.dto;

import java.time.LocalDateTime;
import java.util.List;
import ut.edu.docuhub.chat.ChatSession;

public record ChatSessionDto(Long id, List<Long> documentIds, String title, LocalDateTime createdAt) {

    public static ChatSessionDto from(ChatSession s) {
        return new ChatSessionDto(s.getId(), List.copyOf(s.getDocumentIds()), s.getTitle(), s.getCreatedAt());
    }
}
