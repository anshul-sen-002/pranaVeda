package com.pranaveda.auth;

import com.pranaveda.security.OriginGuard;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Auth endpoints (docs/api-contracts.md):
 * register/login/refresh/logout are public routes - identity is established
 * inside the service; {@code /me} requires a valid access token and resolves
 * the caller from the security context. Every POST validates the browser
 * Origin against the allow-list (CSRF layer for cookie endpoints).
 */
@Tag(name = "Auth")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final RefreshCookieSupport cookies;
    private final OriginGuard originGuard;

    public AuthController(AuthService authService, RefreshCookieSupport cookies, OriginGuard originGuard) {
        this.authService = authService;
        this.cookies = cookies;
        this.originGuard = originGuard;
    }

    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        originGuard.requireAllowedOrigin(httpRequest);
        IssuedSession session = authService.register(request);
        cookies.addCookie(response, session.refreshToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(session.response());
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {
        originGuard.requireAllowedOrigin(httpRequest);
        IssuedSession session = authService.login(request, clientIp(httpRequest));
        cookies.addCookie(response, session.refreshToken());
        return ResponseEntity.ok(session.response());
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(HttpServletRequest httpRequest,
            HttpServletResponse response) {
        originGuard.requireAllowedOrigin(httpRequest);
        IssuedSession session = authService.refresh(cookies.readFrom(httpRequest));
        cookies.addCookie(response, session.refreshToken()); // rotated value
        return ResponseEntity.ok(session.response());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest, HttpServletResponse response) {
        originGuard.requireAllowedOrigin(httpRequest);
        authService.logout(cookies.readFrom(httpRequest));
        cookies.clearCookie(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public UserSummary me() {
        return authService.me();
    }

    /**
     * Best-effort client IP for the sign-in alert. Honors the first entry of a
     * (possibly comma-separated) {@code X-Forwarded-For} header set by a trusted
     * reverse proxy, falling back to the direct remote address. Never throws.
     */
    private static String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            int comma = forwarded.indexOf(',');
            String first = (comma >= 0 ? forwarded.substring(0, comma) : forwarded).trim();
            if (!first.isEmpty()) {
                return first;
            }
        }
        return request.getRemoteAddr();
    }
}
