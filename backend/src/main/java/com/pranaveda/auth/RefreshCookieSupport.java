package com.pranaveda.auth;

import java.time.Duration;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Builds/reads/clears the HttpOnly refresh cookie.
 * Flags: HttpOnly always; Secure per profile (forced true in prod);
 * SameSite=Strict so cross-site requests never carry it (CSRF layer 1);
 * path scoped to the auth endpoints only.
 */
@Component
public class RefreshCookieSupport {

    private final String cookieName;
    private final Duration refreshTtl;
    private final boolean secure;

    public RefreshCookieSupport(
            @Value("${app.security.refresh-cookie-name:pv_refresh}") String cookieName,
            @Value("${app.security.jwt.refresh-ttl}") Duration refreshTtl,
            @Value("${app.security.cookie-secure:false}") boolean secure) {
        this.cookieName = cookieName;
        this.refreshTtl = refreshTtl;
        this.secure = secure;
    }

    public ResponseCookie build(String token) {
        return ResponseCookie.from(cookieName, token)
            .httpOnly(true)
            .secure(secure)
            .path("/api/v1/auth")
            .sameSite("Strict")
            .maxAge(refreshTtl)
            .build();
    }

    public ResponseCookie clear() {
        return ResponseCookie.from(cookieName, "")
            .httpOnly(true)
            .secure(secure)
            .path("/api/v1/auth")
            .sameSite("Strict")
            .maxAge(0)
            .build();
    }

    /** @return the plaintext refresh token from the request cookies, or null */
    public String readFrom(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public void addCookie(HttpServletResponse response, String token) {
        response.addHeader("Set-Cookie", build(token).toString());
    }

    public void clearCookie(HttpServletResponse response) {
        response.addHeader("Set-Cookie", clear().toString());
    }

    public String cookieName() {
        return cookieName;
    }
}
