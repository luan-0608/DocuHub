package ut.edu.docuhub.security;

import io.jsonwebtoken.JwtException;
import java.nio.charset.StandardCharsets;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Chặn sớm tại cổng: mọi route (trừ /api/auth/** và preflight OPTIONS) phải mang
 * Bearer token hợp lệ, nếu không trả 401 luôn — request rác không chạm vào service.
 * Token hợp lệ được chuyển tiếp nguyên vẹn; từng service vẫn tự xác thực lại
 * và tự quyết định phân quyền (defense in depth).
 */
@Component
public class JwtAuthGlobalFilter implements GlobalFilter, Ordered {

    // Cùng hình dạng JSON với ApiResponse của common-lib để frontend xử lý đồng nhất
    private static final String UNAUTHORIZED_BODY =
            "{\"success\":false,\"data\":null,\"message\":\"Phiên đăng nhập không hợp lệ hoặc đã hết hạn\"}";

    private final GatewayJwtVerifier jwtVerifier;

    public JwtAuthGlobalFilter(GatewayJwtVerifier jwtVerifier) {
        this.jwtVerifier = jwtVerifier;
    }

    @Override
    public int getOrder() {
        return -100; // trước các filter định tuyến
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();
        if (HttpMethod.OPTIONS.equals(request.getMethod()) || path.startsWith("/api/auth/")) {
            return chain.filter(exchange);
        }
        String header = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }
        try {
            jwtVerifier.parseRequiringUid(header.substring(7));
        } catch (JwtException | IllegalArgumentException ex) {
            return unauthorized(exchange);
        }
        return chain.filter(exchange);
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        DataBuffer buffer = response.bufferFactory()
                .wrap(UNAUTHORIZED_BODY.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }
}
