package com.pranaveda.security;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import com.pranaveda.common.error.ErrorCode;
import com.pranaveda.common.error.UnauthorizedException;
import com.pranaveda.user.Role;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Stateless HS256 access tokens (architecture section 6): short-lived,
 * returned in the response body, and kept in memory on the frontend.
 * The refresh token is a separate opaque value handled by
 * {@link com.pranaveda.auth.RefreshTokenService}.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final Duration accessTtl;

    public JwtService(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.access-ttl}") Duration accessTtl) {
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException(
                "app.security.jwt.secret must be at least 32 bytes for HS256.");
        }
        this.key = Keys.hmacShaKeyFor(secretBytes);
        this.accessTtl = accessTtl;
    }

    public String createAccessToken(long userId, String email, Role role) {
        Instant now = Instant.now();
        return Jwts.builder()
            .id(UUID.randomUUID().toString())
            .subject(Long.toString(userId))
            .claim("email", email)
            .claim("role", role.name())
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plus(accessTtl)))
            .signWith(key)
            .compact();
    }

    /**
     * @throws UnauthorizedException TOKEN_EXPIRED for expired tokens,
     *         UNAUTHENTICATED for malformed/tampered/invalid ones
     */
    public ParsedAccessToken parse(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            long userId = Long.parseLong(claims.getSubject());
            String email = claims.get("email", String.class);
            Role role = Role.valueOf(claims.get("role", String.class));
            return new ParsedAccessToken(userId, email, role);
        } catch (ExpiredJwtException ex) {
            throw new UnauthorizedException(ErrorCode.TOKEN_EXPIRED, "Access token expired.");
        } catch (JwtException | IllegalArgumentException | NullPointerException ex) {
            throw new UnauthorizedException("Invalid access token.");
        }
    }

    public long accessTtlSeconds() {
        return accessTtl.toSeconds();
    }

    public record ParsedAccessToken(long userId, String email, Role role) {
    }
}
