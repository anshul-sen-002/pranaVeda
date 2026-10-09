package com.pranaveda.security;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import com.pranaveda.common.error.ForbiddenException;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpHeaders;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * CSRF defense for the cookie-authenticated endpoints (/auth/refresh, /logout)
 * layered on top of the SameSite=Strict refresh cookie:
 *
 * <ul>
 *   <li>a browser request that carries an {@code Origin} header must match the
 *       configured allow-list (or the API's own origin, so Swagger UI works);</li>
 *   <li>requests without {@code Origin} (native clients, curl) pass - CSRF is a
 *       browser-only threat and those callers cannot be induced by a page.</>
 * </ul>
 */
@Component
public class OriginGuard {

    private final Set<String> allowedOrigins;

    public OriginGuard(@Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
            .map(String::trim)
            .filter(origin -> !origin.isEmpty())
            .collect(Collectors.toUnmodifiableSet());
    }

    public void requireAllowedOrigin(HttpServletRequest request) {
        String origin = request.getHeader(HttpHeaders.ORIGIN);
        if (origin == null || origin.isBlank()) {
            return; // non-browser client - not a CSRF vector
        }
        String host = request.getHeader(HttpHeaders.HOST);
        String ownOrigin = host == null ? null : request.getScheme() + "://" + host;
        if (allowedOrigins.contains(origin) || origin.equals(ownOrigin)) {
            return;
        }
        throw new ForbiddenException("Origin is not allowed for this endpoint.");
    }
}
