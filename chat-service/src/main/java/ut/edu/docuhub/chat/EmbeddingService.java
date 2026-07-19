package ut.edu.docuhub.chat;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import ut.edu.docuhub.common.exception.AiServiceException;

/**
 * Vector hóa text qua OpenAI embeddings + tính cosine similarity.
 * Tách riêng để Sprint 4 (chat) tái dùng và dễ mock trong test (không gọi API thật).
 */
@Service
public class EmbeddingService {

    private static final String SERVICE = "Dịch vụ embedding";
    private static final String CONFIG_HINT = "embedding.api-key / embedding.base-url / embedding.model";

    private final RestClient restClient;
    private final String model;
    private final String apiKey;
    private final ObjectMapper objectMapper;

    public EmbeddingService(@Value("${embedding.api-key}") String apiKey,
                            @Value("${embedding.base-url}") String baseUrl,
                            @Value("${embedding.model}") String model,
                            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.model = model;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .build();
    }

    public float[] embed(String text) {
        AiErrors.requireApiKey(apiKey, SERVICE, "embedding.api-key");
        EmbeddingResponse response;
        try {
            response = restClient.post()
                    .uri("/embeddings")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("model", model, "input", text))
                    .retrieve()
                    .body(EmbeddingResponse.class);
        } catch (RestClientException e) {
            throw AiErrors.translate(SERVICE, CONFIG_HINT, e);
        }
        if (response == null || response.data() == null || response.data().isEmpty()) {
            throw new AiServiceException(SERVICE + " không trả về kết quả — thử lại sau");
        }
        return response.data().get(0).embedding();
    }

    public double cosine(float[] a, float[] b) {
        double dot = 0, na = 0, nb = 0;
        for (int i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-9);
    }

    public String toJson(float[] vector) {
        try {
            return objectMapper.writeValueAsString(vector);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Lỗi serialize embedding", e);
        }
    }

    public float[] fromJson(String json) {
        try {
            return objectMapper.readValue(json, float[].class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Lỗi parse embedding", e);
        }
    }

    private record EmbeddingResponse(List<Item> data) {
        private record Item(float[] embedding) {}
    }
}
