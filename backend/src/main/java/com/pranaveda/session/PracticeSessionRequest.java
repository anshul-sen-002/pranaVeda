package com.pranaveda.session;

import java.time.Instant;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Record-a-session payload (agents.md 2.10). This IS the explicit "finish
 * session" action: a practice is only counted once the user records it here,
 * never by merely opening a timer.
 *
 * <p>Ownership is never taken from this request - the acting user always comes
 * from the security context (IDOR rule). {@code contentId} and {@code notes}
 * are optional, so a general practice need not reference a single item.
 */
public record PracticeSessionRequest(
        Long contentId,
        @NotNull @Positive @Max(value = 1440, message = "A single session cannot exceed 24 hours.")
        Integer durationMinutes,
        Instant completedAt,
        @Size(max = 500, message = "Notes must be 500 characters or fewer.") String notes) {
}
