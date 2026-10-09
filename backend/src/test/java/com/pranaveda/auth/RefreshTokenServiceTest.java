package com.pranaveda.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

import com.pranaveda.common.error.ErrorCode;
import com.pranaveda.common.error.UnauthorizedException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RefreshTokenServiceTest {

    private RefreshTokenRepository tokens;
    private RefreshTokenService service;
    private final AtomicLong ids = new AtomicLong(1);

    @BeforeEach
    void setUp() {
        tokens = mock(RefreshTokenRepository.class);
        service = new RefreshTokenService(tokens, Duration.ofDays(14));
        // Simulate JPA IDENTITY: save() assigns the id on the entity itself.
        when(tokens.save(any(RefreshToken.class))).thenAnswer(invocation -> {
            RefreshToken entity = invocation.getArgument(0);
            if (ReflectionTestUtils.getField(entity, "id") == null) {
                ReflectionTestUtils.setField(entity, "id", ids.getAndIncrement());
            }
            return entity;
        });
    }

    @Test
    void issueStoresSha256HashNeverPlaintext() {
        RefreshTokenService.IssuedRefreshToken issued = service.issue(7L);

        assertThat(issued.token()).hasSize(43); // 32 random bytes, base64url unpadded
        assertThat(issued.userId()).isEqualTo(7L);

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(tokens).save(captor.capture());
        RefreshToken saved = captor.getValue();
        assertThat(saved.getTokenHash()).hasSize(64);
        assertThat(saved.getTokenHash()).isEqualTo(RefreshTokenService.sha256(issued.token()));
        assertThat(saved.getTokenHash()).isNotEqualTo(issued.token());
        assertThat(saved.getFamilyId()).isEqualTo(issued.familyId());
        assertThat(saved.getExpiresAt()).isAfter(Instant.now());
        assertThat(saved.getRevokedAt()).isNull();
    }

    @Test
    void rotateRevokesCurrentAndIssuesSuccessorInSameFamily() {
        RefreshToken current = activeToken("original-token");
        UUID family = current.getFamilyId();

        RefreshTokenService.IssuedRefreshToken successor = service.rotate("original-token");

        assertThat(successor.familyId()).isEqualTo(family);
        assertThat(successor.token()).isNotEqualTo("original-token");
        assertThat(successor.userId()).isEqualTo(7L);
        assertThat(current.getRevokedAt()).isNotNull();
        assertThat(current.getReplacedById()).isEqualTo(successor.id());
    }

    @Test
    void reuseOfRevokedTokenRevokesWholeFamily() {
        RefreshToken revoked = activeToken("leaked-token");
        revoked.setRevokedAt(Instant.now().minusSeconds(30));
        RefreshToken sibling = new RefreshToken();
        ReflectionTestUtils.setField(sibling, "id", 500L);
        sibling.setUserId(7L);
        sibling.setFamilyId(revoked.getFamilyId());
        sibling.setExpiresAt(Instant.now().plus(Duration.ofDays(1)));
        when(tokens.findAllByFamilyIdAndRevokedAtIsNull(revoked.getFamilyId())).thenReturn(List.of(sibling));

        UnauthorizedException ex = catchThrowableOfType(
            () -> service.rotate("leaked-token"), UnauthorizedException.class);

        assertThat(ex.code()).isEqualTo(ErrorCode.UNAUTHENTICATED);
        assertThat(ex.getMessage()).contains("reuse");
        assertThat(sibling.getRevokedAt()).isNotNull();
    }

    @Test
    void expiredTokenReportsTokenExpired() {
        RefreshToken expired = activeToken("old-token");
        expired.setExpiresAt(Instant.now().minusSeconds(1));

        UnauthorizedException ex = catchThrowableOfType(
            () -> service.rotate("old-token"), UnauthorizedException.class);

        assertThat(ex.code()).isEqualTo(ErrorCode.TOKEN_EXPIRED);
    }

    @Test
    void unknownTokenRejected() {
        when(tokens.findByTokenHash(anyString())).thenReturn(Optional.empty());

        UnauthorizedException ex = catchThrowableOfType(
            () -> service.rotate("who-is-this"), UnauthorizedException.class);

        assertThat(ex.code()).isEqualTo(ErrorCode.UNAUTHENTICATED);
    }

    @Test
    void blankTokenRejectedWithoutTouchingTheDatabase() {
        assertThatThrownBy(() -> service.rotate(null)).isInstanceOf(UnauthorizedException.class);
        assertThatThrownBy(() -> service.rotate("   ")).isInstanceOf(UnauthorizedException.class);
        verify(tokens, never()).findByTokenHash(any());
    }

    @Test
    void revokeMarksActiveTokenAndIsIdempotent() {
        RefreshToken active = activeToken("logout-me");

        service.revoke("logout-me");
        assertThat(active.getRevokedAt()).isNotNull();

        service.revoke("logout-me"); // second call: already revoked, no crash
        assertThat(active.getRevokedAt()).isNotNull();
    }

    @Test
    void revokeIgnoresBlankAndUnknownTokens() {
        service.revoke(null);
        service.revoke("");
        verify(tokens, never()).findByTokenHash(any());

        when(tokens.findByTokenHash(anyString())).thenReturn(Optional.empty());
        service.revoke("unknown");
        verify(tokens, never()).save(any(RefreshToken.class));
    }

    /** Builds an active token in the repository stub for the given plaintext. */
    private RefreshToken activeToken(String plainToken) {
        RefreshToken token = new RefreshToken();
        ReflectionTestUtils.setField(token, "id", 100L);
        token.setUserId(7L);
        token.setTokenHash(RefreshTokenService.sha256(plainToken));
        token.setFamilyId(UUID.randomUUID());
        token.setExpiresAt(Instant.now().plus(Duration.ofDays(1)));
        when(tokens.findByTokenHash(RefreshTokenService.sha256(plainToken)))
            .thenReturn(Optional.of(token));
        return token;
    }
}

