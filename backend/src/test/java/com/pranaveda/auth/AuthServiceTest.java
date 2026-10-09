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
