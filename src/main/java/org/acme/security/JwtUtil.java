package org.acme.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.eclipse.microprofile.config.Config;
import org.eclipse.microprofile.config.ConfigProvider;

import java.security.Key;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.nio.charset.StandardCharsets;

public final class JwtUtil {
    private static final Config CONFIG = ConfigProvider.getConfig();
    private static final String SECRET = getSecret();
    private static final Key KEY = buildKey(SECRET);
    private static final long EXPIRATION_SECONDS = Long.parseLong(CONFIG.getOptionalValue("jwt.expiration.seconds", String.class).orElse("3600"));

    private JwtUtil() {}

    private static String getSecret() {
        return CONFIG.getOptionalValue("jwt.secret", String.class).orElse("changeit-changeit-changeit-changeit");
    }

    private static Key buildKey(String secret) {
        if (secret == null) secret = "changeit-changeit-changeit-changeit";
        try {
            byte[] decoded = null;
            try {
                decoded = Decoders.BASE64.decode(secret);
            } catch (Exception ex) {
                decoded = secret.getBytes(StandardCharsets.UTF_8);
            }
            return Keys.hmacShaKeyFor(decoded);
        } catch (Exception e) {
            byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
            return Keys.hmacShaKeyFor(bytes);
        }
    }

    public static String generateToken(String username, Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(EXPIRATION_SECONDS)))
                .signWith(KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public static Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public static boolean isTokenExpired(Claims claims) {
        Date exp = claims.getExpiration();
        return exp == null || exp.before(new Date());
    }
}

