package ut.edu.docuhub.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Xác minh JWT ngay tại gateway để chặn sớm request không hợp lệ.
 * Cùng thuật toán/secret với common-lib JwtVerifier (gateway không dùng được
 * common-lib vì chạy WebFlux, common-lib kéo theo servlet stack).
 */
@Component
public class GatewayJwtVerifier {

    private final SecretKey key;

    public GatewayJwtVerifier(@Value("${app.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    /** Xác minh chữ ký + hạn dùng; token thiếu claim uid (định dạng cũ) bị từ chối. */
    public Claims parseRequiringUid(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
        if (!(claims.get("uid") instanceof Number)) {
            throw new MalformedJwtException("Token thiếu claim uid");
        }
        return claims;
    }
}
