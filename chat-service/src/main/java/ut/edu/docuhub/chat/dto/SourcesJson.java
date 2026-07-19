package ut.edu.docuhub.chat.dto;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

/**
 * Chuyển danh sách nguồn trích dẫn qua lại với JSON lưu trong cột chat_messages.sources.
 * Nguồn chỉ là phần bổ trợ nên mọi lỗi parse/serialize đều nuốt êm, không làm hỏng tin nhắn.
 */
public final class SourcesJson {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private SourcesJson() {
    }

    public static String write(List<SourceRefDto> sources) {
        if (sources == null || sources.isEmpty()) {
            return null;
        }
        try {
            return MAPPER.writeValueAsString(sources);
        } catch (Exception e) {
            return null;
        }
    }

    public static List<SourceRefDto> read(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return MAPPER.readValue(json, new TypeReference<List<SourceRefDto>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
