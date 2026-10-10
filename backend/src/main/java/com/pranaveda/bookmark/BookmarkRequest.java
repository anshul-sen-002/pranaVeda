package com.pranaveda.bookmark;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Save/unsave payload. Ownership is NEVER taken from this request - the acting
 * user always comes from the security context (IDOR rule, architecture §6).
 */
public record BookmarkRequest(
        @NotNull BookmarkTarget targetType,
        @NotNull @Positive long targetId) {
}
