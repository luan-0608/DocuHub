package ut.edu.docuhub.chat;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EmbeddingServiceTest {

    private final EmbeddingService service =
            new EmbeddingService("test-key", "https://api.openai.com/v1",
                    "text-embedding-3-small", new ObjectMapper());

    @Test
    void cosine_identicalVectors_isOne() {
        float[] v = {1f, 2f, 3f};
        assertThat(service.cosine(v, v)).isCloseTo(1.0, org.assertj.core.api.Assertions.within(1e-6));
    }

    @Test
    void cosine_orthogonalVectors_isZero() {
        assertThat(service.cosine(new float[] {1f, 0f}, new float[] {0f, 1f}))
                .isCloseTo(0.0, org.assertj.core.api.Assertions.within(1e-6));
    }

    @Test
    void json_roundTrip_preservesVector() {
        float[] v = {0.1f, -0.5f, 0.9f};
        assertThat(service.fromJson(service.toJson(v))).containsExactly(v);
    }
}
