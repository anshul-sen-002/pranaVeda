package com.pranaveda.security;

import com.pranaveda.common.error.UnauthorizedException;
import com.pranaveda.user.Role;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * The authenticated principal placed into the SecurityContext by
 * {@link JwtAuthenticationFilter}. Services resolve the acting user from
 * here - never from path or body IDs (architecture section 6, IDOR rule).
 */
public record CurrentUserPrincipal(long userId, String email, Role role) {

    /** @throws UnauthorizedException when no valid authentication is present */
    public static CurrentUserPrincipal requireCurrent() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
            || !authentication.isAuthenticated()
            || !(authentication.getPrincipal() instanceof CurrentUserPrincipal principal)) {
            throw new UnauthorizedException("Authentication required.");
        }
        return principal;
    }

    public static long requireCurrentUserId() {
        return requireCurrent().userId();
    }
}
