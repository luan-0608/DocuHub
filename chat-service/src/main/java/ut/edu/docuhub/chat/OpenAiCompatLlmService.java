package ut.edu.docuhub.chat;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import ut.edu.docuhub.common.exception.AiServiceException;

/**
 * Chat theo chuẩn OpenAI (POST /chat/completions, Bearer key) — dùng cho OpenAI
 * hoặc bất kỳ nhà cung cấp thứ 3 nào tương thích, chỉ cần đổi llm.base-url.
 */
@Service
@ConditionalOnProperty(name = "llm.provider", havingValue = "openai", matchIfMissing = true)
public class OpenAiCompatLlmService implements LlmService {

    private static final String SERVICE = "Dịch vụ chat AI";
    private static final String CONFIG_HINT = "llm.api-key / llm.base-url / llm.chat-model";

    private final RestClient restClient;
    private final String model;
    private final String apiKey;

    public OpenAiCompatLlmService(@Value("${llm.api-key}") String apiKey,
                                  @Value("${llm.base-url}") String baseUrl,
                                  @Value("${llm.chat-model}") String model) {
        this.apiKey = apiKey;
        this.model = model;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
    }

    @Override
    public String chat(String prompt) {
        AiErrors.requireApiKey(apiKey, SERVICE, "llm.api-key");
        var body = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", prompt)));
        ChatCompletionResponse response;
        try {
            response = restClient.post()
                    .uri("/chat/completions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(ChatCompletionResponse.class);
        } catch (RestClientException e) {
            throw AiErrors.translate(SERVICE, CONFIG_HINT, e);
        }
        if (response == null || response.choices() == null || response.choices().isEmpty()) {
            throw new AiServiceException(SERVICE + " không trả về câu trả lời — thử lại sau");
        }
        return response.choices().get(0).message().content();
    }

    private record ChatCompletionResponse(List<Choice> choices) {
        private record Choice(Message message) {}
        private record Message(String content) {}
    }
}
