package ut.edu.docuhub.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.GatewayFilterSpec;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Bảng định tuyến duy nhất của hệ thống. lb:// = tra Eureka lấy địa chỉ thật
 * của service rồi cân bằng tải phía client.
 */
@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator docuhubRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                // POST /api/documents/{id}/summary do chat-service xử lý (tóm tắt bằng AI)
                // nên phải khớp TRƯỚC route /api/documents/** của document-service
                .route("chat-summary", r -> r.order(-1)
                        .path("/api/documents/*/summary")
                        .filters(this::dedupeCors)
                        .uri("lb://chat-service"))
                .route("user-service", r -> r
                        .path("/api/auth/**", "/api/users/**", "/api/admin/users/**")
                        .filters(this::dedupeCors)
                        .uri("lb://user-service"))
                .route("document-service", r -> r
                        .path("/api/documents/**", "/api/admin/documents/**")
                        .filters(this::dedupeCors)
                        .uri("lb://document-service"))
                .route("chat-service", r -> r
                        .path("/api/chat/**")
                        .filters(this::dedupeCors)
                        .uri("lb://chat-service"))
                .build();
    }

    // Service phía sau cũng bật CORS (để gọi thẳng khi dev); đi qua gateway thì
    // header CORS bị nhân đôi — giữ một bản kẻo trình duyệt từ chối response
    private GatewayFilterSpec dedupeCors(GatewayFilterSpec f) {
        return f.dedupeResponseHeader(
                "Access-Control-Allow-Origin Access-Control-Allow-Credentials", "RETAIN_FIRST");
    }
}
