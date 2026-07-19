package ut.edu.docuhub.chat;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import ut.edu.docuhub.common.exception.AiServiceException;

/** Chat qua Google Gemini (generateContent). Bật bằng llm.provider=gemini. */
@Service
@ConditionalOnProperty(name = "llm.provider", havingValue = "gemini")
public class GeminiLlmService implements LlmService {

    private static final String SERVICE = "Dịch vụ chat AI (Gemini)";
    private static final String CONFIG_HINT = "llm.api-key / llm.base-url / llm.chat-model";

    private final RestClient restClient;
    private final String model;
    private final String apiKey;

    public GeminiLlmService(@Value("${llm.api-key}") String apiKey,
                            @Value("${llm.base-url}") String baseUrl,
                            @Value("${llm.chat-model}") String model) {
        this.apiKey = apiKey;
        this.model = model;
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    @Override
    public String chat(String prompt) {
        AiErrors.requireApiKey(apiKey, SERVICE, "llm.api-key");
        var body = Map.of("contents",
                List.of(Map.of("parts", List.of(Map.of("text", prompt)))));
        GeminiResponse response;
        try {
            response = restClient.post()
                    .uri("/models/{model}:generateContent?key={key}", model, apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GeminiResponse.class);
        } catch (RestClientException e) {
            throw AiErrors.translate(SERVICE, CONFIG_HINT, e);
        }
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            throw new AiServiceException(SERVICE + " không trả về câu trả lời — thử lại sau");
        }
        return response.candidates().get(0).content().parts().get(0).text();
    }

    private record GeminiResponse(List<Candidate> candidates) {
        private record Candidate(Content content) {}
        private record Content(List<Part> parts) {}
        private record Part(String text) {}
    }
}
