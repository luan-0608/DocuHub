package ut.edu.docuhub.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Mọi request Feign đều gắn X-Internal-Token — phía document-service,
 * InternalTokenFilter (common-lib) đổi token này thành ROLE_INTERNAL
 * để mở khóa /internal/**.
 */
@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor internalTokenInterceptor(@Value("${app.internal.token}") String token) {
        return template -> template.header("X-Internal-Token", token);
    }
}
