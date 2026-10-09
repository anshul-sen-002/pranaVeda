package com.pranaveda.security;

import java.time.Duration;

import com.pranaveda.common.error.ErrorCode;
import com.pranaveda.common.error.UnauthorizedException;
import com.pranaveda.user.Role;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

class JwtServiceTest {

    private static final String SECRET = "unit-test-secret-0123456789abcdef0123456789";

    @Test
    void roundTripPreservesClaims() {
        JwtService service = new JwtService(SECRET, Duration.ofMinutes(15));

        String token = service.createAccessToken(42L, "demo@pranaveda.dev", Role.USER);
        JwtService.ParsedAccessToken parsed = service.parse(token);

        assertThat(parsed.userId()).isEqualTo(42L);
        assertThat(parsed.email()).isEqualTo("demo@pranaveda.dev");
        assertThat(parsed.role()).isEqualTo(Role.USER);
        assertThat(service.accessTtlSeconds()).isEqualTo(900L);
    }

    @Test
    void expiredTokenReportsTokenExpired() {
        JwtService service = new JwtService(SECRET, Duration.ofMinutes(-5));
        String token = service.createAccessToken(1L, "a@b.c", Role.USER);

        UnauthorizedException ex = catchThrowableOfType(
            () -> service.parse(token), UnauthorizedException.class);

        assertThat(ex.code()).isEqualTo(ErrorCode.TOKEN_EXPIRED);
    }

    @Test
    void tamperedTokenRejectedAsUnauthenticated() {
        JwtService service = new JwtService(SECRET, Duration.ofMinutes(15));
        String token = service.createAccessToken(1L, "a@b.c", Role.USER);
        String[] parts = token.split("\\.");
        String tampered = parts[0] + "." + new StringBuilder(parts[1]).reverse() + "." + parts[2];

        UnauthorizedException ex = catchThrowableOfType(
            () -> service.parse(tampered), UnauthorizedException.class);

        assertThat(ex.code()).isEqualTo(ErrorCode.UNAUTHENTICATED);
    }

    @Test
    void tokenSignedWithDifferentSecretRejected() {
        String otherSecret = "another-secret-9876543210fedcba9876543210fedcba";
        String foreignToken = new JwtService(otherSecret, Duration.ofMinutes(15))
            .createAccessToken(1L, "a@b.c", Role.USER);

        JwtService service = new JwtService(SECRET, Duration.ofMinutes(15));
        UnauthorizedException ex = catchThrowableOfType(
            () -> service.parse(foreignToken), UnauthorizedException.class);

        assertThat(ex.code()).isEqualTo(ErrorCode.UNAUTHENTICATED);
    }

    @Test
    void shortSecretRefusedAtStartup() {
        assertThatThrownBy(() -> new JwtService("too-short", Duration.ofMinutes(15)))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("at least 32 bytes");
    }
}
