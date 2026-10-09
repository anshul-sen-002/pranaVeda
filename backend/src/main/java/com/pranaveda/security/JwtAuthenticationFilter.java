package com.pranaveda.security;

import java.io.IOException;
import java.util.List;

import com.pranaveda.common.error.UnauthorizedException;
import com.pranaveda.user.User;
import com.pranaveda.user.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Parses {@code Authorization: Bearer <jwt>} on every request.
 * The authoritative role is loaded from the database (disabled accounts and
 * role changes take effect immediately). Invalid/expired tokens do not fail
 * the request here - they leave the caller anonymous so public endpoints keep
 * working, and {@link ApiAuthenticationEntryPoint} reports the reason from
 * {@link #AUTH_ERROR_ATTRIBUTE} when a protected endpoint is reached.
 *
 * <p>Not a Spring bean on purpose: it is created inside SecurityConfig and
 * added to the security chain only, so Boot does not also register it as a
 * servlet filter (which would run it twice).
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /** Request attribute carrying the ErrorCode name when a bearer token was rejected. */
    public static final String AUTH_ERROR_ATTRIBUTE = "pv.authError";

    private final JwtService jwtService;
    private final UserRepository users;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository users) {
        this.jwtService = jwtService;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.regionMatches(true, 0, "Bearer ", 0, 7)) {
            String token = header.substring(7).trim();
            if (!token.isEmpty()) {
                try {
                    JwtService.ParsedAccessToken parsed = jwtService.parse(token);
                    users.findById(parsed.userId())
                        .filter(User::isEnabled)
                        .ifPresent(user -> setAuthentication(request, user));
                } catch (UnauthorizedException ex) {
                    request.setAttribute(AUTH_ERROR_ATTRIBUTE, ex.code().name());
                }
            }
        }
        try {
            filterChain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private static void setAuthentication(HttpServletRequest request, User user) {
        var principal = new CurrentUserPrincipal(user.getId(), user.getEmail(), user.getRole());
        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        var authentication = new UsernamePasswordAuthenticationToken(principal, null, authorities);
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
