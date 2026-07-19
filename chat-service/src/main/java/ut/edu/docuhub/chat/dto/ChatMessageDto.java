package ut.edu.docuhub.chat.dto;

import java.time.LocalDateTime;
import java.util.List;
import ut.edu.docuhub.chat.ChatMessage;

public record ChatMessageDto(Long id, String role, String content, LocalDateTime createdAt,
                             List<SourceRefDto> sources) {

    public static ChatMessageDto from(ChatMessage m) {
        return new ChatMessageDto(m.getId(), m.getRole().name(), m.getContent(), m.getCreatedAt(),
                SourcesJson.read(m.getSources()));
    }
}
