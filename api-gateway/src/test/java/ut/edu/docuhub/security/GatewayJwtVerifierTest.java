package ut.edu.docuhub.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;

class GatewayJwtVerifierTest {

    private static final String SECRET = "dGVzdC1zZWNyZXQtdGVzdC1zZWNyZXQtdGVzdC1zZWNyZXQhIQ==";

    private final SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET));
    private final GatewayJwtVerifier verifier = new GatewayJwtVerifier(SECRET);

    private String token(boolean withUid) {
        var builder = Jwts.builder()
                .subject("sv@ut.edu.vn")
                .claim("role", "USER")
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(key);
        if (withUid) {
            builder.claim("uid", 42);
        }
        return builder.compact();
    }

    @Test
    void parse_validToken_returnsClaims() {
        Claims claims = verifier.parseRequiringUid(token(true));

        assertThat(claims.getSubject()).isEqualTo("sv@ut.edu.vn");
        assertThat(claims.get("uid", Long.class)).isEqualTo(42L);
    }

    @Test
    void parse_tokenWithoutUid_rejected() {
        assertThatThrownBy(() -> verifier.parseRequiringUid(token(false)))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void parse_tokenSignedWithDifferentKey_rejected() {
        String otherSecret = "a2hhYy1zZWNyZXQta2hhYy1zZWNyZXQta2hhYy1zZWNyZXQhIQ==";
        String forged = Jwts.builder()
                .subject("hacker@x.vn")
                .claim("uid", 1)
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(otherSecret)))
                .compact();

        assertThatThrownBy(() -> verifier.parseRequiringUid(forged))
                .isInstanceOf(JwtException.class);
    }
}
