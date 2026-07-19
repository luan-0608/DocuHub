package ut.edu.docuhub.chat;

/**
 * Sinh câu trả lời từ prompt. Có 2 implementation chọn qua {@code llm.provider}:
 * OpenAiCompatLlmService (chuẩn OpenAI, dùng được cho bên thứ 3 tương thích)
 * và GeminiLlmService. Tách interface để ChatService không phụ thuộc nhà cung cấp.
 */
public interface LlmService {

    String chat(String prompt);
}
