package com.pranaveda.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

import com.pranaveda.common.error.ErrorCode;
import com.pranaveda.common.error.UnauthorizedException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Opaque refresh tokens: 256-bit random values delivered only in an
 * HttpOnly cookie; the database stores SHA-256 hashes (architecture section 6).
 *
 * <p>Rotation: every refresh revokes the presented token and issues a
 * successor in the same family. Presenting an already-revoked token means the
 * cookie leaked - the entire family is revoked and the session dies.
 */
@Service
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository tokens;
    private final Duration refreshTtl;

    public RefreshTokenService(RefreshTokenRepository tokens,
                               @Value("${app.security.jwt.refresh-ttl}") Duration refreshTtl) {
        this.tokens = tokens;
        this.refreshTtl = refreshTtl;
    }

    /** First token of a brand-new family - used by register and login. */
    @Transactional
    public IssuedRefreshToken issue(long userId) {
        return issueInFamily(userId, UUID.randomUUID());
    }

    /**
     * Rotates the presented token.
     *
     * @throws UnauthorizedException UNAUTHENTICATED when missing/unknown,
     *         TOKEN_EXPIRED when expired; reuse of a revoked token revokes the
     *         whole family and then throws UNAUTHENTICATED.
     */
    @Transactional
    public IssuedRefreshToken rotate(String plainToken) {
        if (plainToken == null || plainToken.isBlank()) {
            throw new UnauthorizedException("Missing refresh token.");
        }
        RefreshToken current = tokens.findByTokenHash(sha256(plainToken))
            .orElseThrow(() -> new UnauthorizedException("Invalid refresh token."));

        if (current.getRevokedAt() != null) {
            revokeFamily(current.getFamilyId());
            throw new UnauthorizedException("Refresh token reuse detected. Session revoked.");
        }
        if (current.getExpiresAt().isBefore(Instant.now())) {
            throw new UnauthorizedException(ErrorCode.TOKEN_EXPIRED, "Refresh token expired.");
        }

        IssuedRefreshToken successor = issueInFamily(current.getUserId(), current.getFamilyId());
        current.setRevokedAt(Instant.now());
        current.setReplacedById(successor.id());
        tokens.save(current);
        return successor;
    }

    /** Revokes the presented token if it is still active (logout). Idempotent. */
    @Transactional
    public void revoke(String plainToken) {
        if (plainToken == null || plainToken.isBlank()) {
            return;
        }
        tokens.findByTokenHash(sha256(plainToken)).ifPresent(token -> {
            if (token.getRevokedAt() == null) {
                token.setRevokedAt(Instant.now());
                tokens.save(token);
            }
        });
    }

    private IssuedRefreshToken issueInFamily(long userId, UUID familyId) {
        String plain = generateToken();
        RefreshToken entity = new RefreshToken();
        entity.setUserId(userId);
        entity.setTokenHash(sha256(plain));
        entity.setFamilyId(familyId);
        entity.setExpiresAt(Instant.now().plus(refreshTtl));
        tokens.save(entity);
        return new IssuedRefreshToken(plain, entity.getId(), familyId, userId);
    }

    private void revokeFamily(UUID familyId) {
        Instant now = Instant.now();
        for (RefreshToken token : tokens.findAllByFamilyIdAndRevokedAtIsNull(familyId)) {
            token.setRevokedAt(now);
            tokens.save(token);
        }
    }

    private static String generateToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }

    /** A freshly issued refresh token: {@code token} is the plaintext cookie value. */
    public record IssuedRefreshToken(String token, long id, UUID familyId, long userId) {
    }
}
