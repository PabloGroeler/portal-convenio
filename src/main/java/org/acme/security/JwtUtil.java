package org.acme.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.nio.charset.StandardCharsets;

@ApplicationScoped
public class JwtUtil {

    @ConfigProperty(name = "jwt.secret", defaultValue = "changeit-changeit-changeit-changeit")
    String secret;

    @ConfigProperty(name = "jwt.expiration.seconds", defaultValue = "3600")
    long expirationSeconds;

    private Key key;

    // Inicialização lazy do key
    private Key getKey() {
        if (key == null) {
            key = buildKey(secret);
        }
        return key;
    }

    private Key buildKey(String secret) {
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

    public String generateToken(String username, Long userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate JWT token with user role and status for RBAC
     */
    public String generateToken(String username, Long userId, String role, String status) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .claim("role", role)
                .claim("status", status)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract user role from token
     */
    public String getRoleFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.get("role", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extract user status from token
     */
    public String getStatusFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.get("status", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extract userId from token
     */
    public Long getUserIdFromToken(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.get("userId", Long.class);
        } catch (Exception e) {
            return null;
        }
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenExpired(Claims claims) {
        Date exp = claims.getExpiration();
        return exp == null || exp.before(new Date());
    }
}

