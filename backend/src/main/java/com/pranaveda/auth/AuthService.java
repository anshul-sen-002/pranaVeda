package com.pranaveda.auth;

import com.pranaveda.common.error.ConflictException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.common.error.UnauthorizedException;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.security.JwtService;
import com.pranaveda.user.Role;
import com.pranaveda.user.User;
import com.pranaveda.user.UserRepository;
import com.pranaveda.user.UserService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication flows (agents.md section 2.3):
 * register always creates USER, login answers with one generic error for
 * unknown email and wrong password (no user enumeration), refresh rotates the
 * cookie token, logout revokes it, me resolves the caller from the security
 * context - never from request data.
 */
@Service
public class AuthService {

    private final UserService userService;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    public AuthService(UserService userService,
                       UserRepository users,
                       PasswordEncoder passwordEncoder,
                       RefreshTokenService refreshTokenService,
                       JwtService jwtService) {
        this.userService = userService;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
    }

    @Transactional
    public IssuedSession register(RegisterRequest request) {
        if (userService.emailExists(request.email())) {
            throw new ConflictException("An account with this email already exists.");
        }
        User user = userService.create(request.email(), request.password(), request.displayName(), Role.USER);
        RefreshTokenService.IssuedRefreshToken refresh = refreshTokenService.issue(user.getId());
        return session(user, refresh.token());
    }

    @Transactional
    public IssuedSession login(LoginRequest request) {
        User user = users.findByEmail(UserService.normalizeEmail(request.email()))
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }
        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account is disabled.");
        }
        RefreshTokenService.IssuedRefreshToken refresh = refreshTokenService.issue(user.getId());
        return session(user, refresh.token());
    }

    @Transactional
    public IssuedSession refresh(String plainRefreshToken) {
        RefreshTokenService.IssuedRefreshToken rotated = refreshTokenService.rotate(plainRefreshToken);
        User user = users.findById(rotated.userId())
            .filter(User::isEnabled)
            .orElseThrow(() -> new UnauthorizedException("Account is disabled."));
        return session(user, rotated.token());
    }

    /** Idempotent - missing/unknown tokens are fine (cookie is always cleared). */
    public void logout(String plainRefreshToken) {
        refreshTokenService.revoke(plainRefreshToken);
    }

    @Transactional(readOnly = true)
    public UserSummary me() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        User user = users.findById(userId)
            .orElseThrow(() -> new NotFoundException("User not found."));
        return UserSummary.from(user);
    }

    private IssuedSession session(User user, String refreshToken) {
        TokenResponse response = new TokenResponse(
            jwtService.createAccessToken(user.getId(), user.getEmail(), user.getRole()),
            "Bearer", jwtService.accessTtlSeconds(), UserSummary.from(user));
        return new IssuedSession(response, refreshToken);
    }
}
