package com.pranaveda.auth;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import com.pranaveda.common.error.ConflictException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.common.error.UnauthorizedException;
import com.pranaveda.mail.EmailService;
import com.pranaveda.notification.NotificationService;
import com.pranaveda.notification.NotificationType;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.security.JwtService;
import com.pranaveda.user.Role;
import com.pranaveda.user.User;
import com.pranaveda.user.UserRepository;
import com.pranaveda.user.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserService userService;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public AuthService(UserService userService,
                       UserRepository users,
                       PasswordEncoder passwordEncoder,
                       RefreshTokenService refreshTokenService,
                       JwtService jwtService,
                       NotificationService notificationService,
                       EmailService emailService) {
        this.userService = userService;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenService = refreshTokenService;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @Transactional
    public IssuedSession register(RegisterRequest request) {
        if (userService.emailExists(request.email())) {
            throw new ConflictException("An account with this email already exists.");
        }
        User user = userService.create(request.email(), request.password(), request.displayName(), Role.USER);
        RefreshTokenService.IssuedRefreshToken refresh = refreshTokenService.issue(user.getId());
        welcome(user);
        return session(user, refresh.token());
    }

    @Transactional
    public IssuedSession login(LoginRequest request, String ip) {
        User user = users.findByEmail(UserService.normalizeEmail(request.email()))
            .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }
        if (!user.isEnabled()) {
            throw new UnauthorizedException("Account is disabled.");
        }
        RefreshTokenService.IssuedRefreshToken refresh = refreshTokenService.issue(user.getId());
        onSignIn(user, ip);
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

    /** Best-effort welcome notification; never breaks registration. */
    private void welcome(User user) {
        try {
            notificationService.create(user.getId(), NotificationType.WELCOME,
                "Welcome to PranaVeda",
                "Hi " + user.getDisplayName()
                    + ", your calm practice space is ready. Explore yoga, guided audio, and your personal dashboard.",
                "/dashboard");
        } catch (RuntimeException ex) {
            log.warn("Failed to create welcome notification for user {}", user.getId(), ex);
        }
    }

    /** Best-effort sign-in alert (in-app + email); never breaks login. */
    private void onSignIn(User user, String ip) {
        try {
            String when = OffsetDateTime.now(ZoneOffset.UTC).toString();
            notificationService.create(user.getId(), NotificationType.LOGIN_ALERT,
                "New sign-in to your account",
                "We noticed a sign-in to your PranaVeda account"
                    + (ip != null && !ip.isBlank() ? " from " + ip : "")
                    + ". If this wasn't you, please change your password.",
                null);
            emailService.sendLoginAlert(user.getEmail(), user.getDisplayName(), when, ip);
        } catch (RuntimeException ex) {
            log.warn("Failed to record sign-in alert for user {}", user.getId(), ex);
        }
    }
}
