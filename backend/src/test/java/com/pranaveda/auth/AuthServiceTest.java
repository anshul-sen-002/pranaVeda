package com.pranaveda.auth;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.pranaveda.common.error.ConflictException;
import com.pranaveda.common.error.ErrorCode;
import com.pranaveda.common.error.UnauthorizedException;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.security.JwtService;
import com.pranaveda.user.Role;
import com.pranaveda.user.User;
import com.pranaveda.user.UserRepository;
import com.pranaveda.user.UserService;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private UserService userService;
    private UserRepository users;
    private PasswordEncoder passwordEncoder;
    private RefreshTokenService refreshTokenService;
    private JwtService jwtService;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        users = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        refreshTokenService = mock(RefreshTokenService.class);
        jwtService = mock(JwtService.class);
        authService = new AuthService(userService, users, passwordEncoder, refreshTokenService, jwtService);

        when(jwtService.createAccessToken(anyLong(), anyString(), any(Role.class))).thenReturn("access-jwt");
        when(jwtService.accessTtlSeconds()).thenReturn(900L);
        when(refreshTokenService.issue(anyLong())).thenAnswer(invocation ->
            new RefreshTokenService.IssuedRefreshToken(
                "refresh-plain", 1L, UUID.randomUUID(), invocation.getArgument(0)));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void registerCreatesUserAndSession() {
        when(userService.emailExists("new@pranaveda.dev")).thenReturn(false);
        when(userService.create("new@pranaveda.dev", "password123", "New User", Role.USER))
            .thenReturn(user(11L));

        IssuedSession session = authService.register(
            new RegisterRequest("new@pranaveda.dev", "password123", "New User"));

        assertThat(session.refreshToken()).isEqualTo("refresh-plain");
        assertThat(session.response().accessToken()).isEqualTo("access-jwt");
        assertThat(session.response().tokenType()).isEqualTo("Bearer");
        assertThat(session.response().expiresIn()).isEqualTo(900L);
        assertThat(session.response().user().role()).isEqualTo(Role.USER);
        verify(userService).create("new@pranaveda.dev", "password123", "New User", Role.USER);
    }

    @Test
    void registerRejectsDuplicateEmailWithConflict() {
        when(userService.emailExists("taken@pranaveda.dev")).thenReturn(true);

        ConflictException ex = catchThrowableOfType(
            () -> authService.register(new RegisterRequest("taken@pranaveda.dev", "password123", "Taken")),
            ConflictException.class);

        assertThat(ex.code()).isEqualTo(ErrorCode.CONFLICT);
        verify(userService, never()).create(any(), any(), any(), any());
    }

    @Test
    void unknownEmailAndWrongPasswordShareOneError() {
        when(users.findByEmail("ghost@pranaveda.dev")).thenReturn(Optional.empty());
        UnauthorizedException unknown = catchThrowableOfType(
            () -> authService.login(new LoginRequest("ghost@pranaveda.dev", "password123")),
            UnauthorizedException.class);

        User existing = user(5L);
        when(users.findByEmail("demo@pranaveda.dev")).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("wrong-password", existing.getPasswordHash())).thenReturn(false);
        UnauthorizedException wrongPassword = catchThrowableOfType(
            () -> authService.login(new LoginRequest("demo@pranaveda.dev", "wrong-password")),
            UnauthorizedException.class);

        assertThat(unknown.getMessage()).isEqualTo(wrongPassword.getMessage());
        assertThat(unknown.code()).isEqualTo(ErrorCode.UNAUTHENTICATED);
        assertThat(wrongPassword.code()).isEqualTo(ErrorCode.UNAUTHENTICATED);
    }

    @Test
    void loginSuccessIssuesSession() {
        User existing = user(5L);
        when(users.findByEmail("demo@pranaveda.dev")).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("password123", existing.getPasswordHash())).thenReturn(true);

        IssuedSession session = authService.login(new LoginRequest("demo@pranaveda.dev", "password123"));

        assertThat(session.response().accessToken()).isEqualTo("access-jwt");
        assertThat(session.refreshToken()).isEqualTo("refresh-plain");
    }

    @Test
    void loginDisabledAccountRejected() {
        User existing = user(5L);
        existing.setEnabled(false);
        when(users.findByEmail("demo@pranaveda.dev")).thenReturn(Optional.of(existing));
        when(passwordEncoder.matches("password123", existing.getPasswordHash())).thenReturn(true);

        UnauthorizedException ex = catchThrowableOfType(
            () -> authService.login(new LoginRequest("demo@pranaveda.dev", "password123")),
            UnauthorizedException.class);

        assertThat(ex.getMessage()).isEqualTo("Account is disabled.");
    }

    @Test
    void refreshUsesRotatedTokenForNewSession() {
        RefreshTokenService.IssuedRefreshToken rotated =
            new RefreshTokenService.IssuedRefreshToken("rotated-plain", 2L, UUID.randomUUID(), 5L);
        when(refreshTokenService.rotate("old-plain")).thenReturn(rotated);
        when(users.findById(5L)).thenReturn(Optional.of(user(5L)));

        IssuedSession session = authService.refresh("old-plain");

        assertThat(session.refreshToken()).isEqualTo("rotated-plain");
        assertThat(session.response().accessToken()).isEqualTo("access-jwt");
    }

    @Test
    void logoutDelegatesRevocation() {
        authService.logout("some-token");
        verify(refreshTokenService).revoke("some-token");
    }

    @Test
    void meRequiresAuthentication() {
        UnauthorizedException ex = catchThrowableOfType(() -> authService.me(), UnauthorizedException.class);
        assertThat(ex.code()).isEqualTo(ErrorCode.UNAUTHENTICATED);
    }

    @Test
    void meReturnsSummaryOfContextUser() {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                new CurrentUserPrincipal(5L, "demo@pranaveda.dev", Role.USER), null, List.of()));
        when(users.findById(5L)).thenReturn(Optional.of(user(5L)));

        UserSummary summary = authService.me();

        assertThat(summary.id()).isEqualTo(5L);
        assertThat(summary.email()).isEqualTo("demo@pranaveda.dev");
        assertThat(summary.role()).isEqualTo(Role.USER);
    }

    private static User user(long id) {
        User user = new User();
        ReflectionTestUtils.setField(user, "id", id);
        user.setEmail("demo@pranaveda.dev");
        user.setDisplayName("Demo User");
        user.setRole(Role.USER);
        user.setPasswordHash("$2a$12$abcdefghijklmnopqrstuv");
        return user;
    }
}

