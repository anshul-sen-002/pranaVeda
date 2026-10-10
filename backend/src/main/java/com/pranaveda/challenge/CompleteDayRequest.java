package com.pranaveda.challenge;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;

/**
 * Request to mark today's challenge day complete (agents.md 2.11). The member
 * reports the minutes practised; the backend validates them against the
 * challenge's daily goal and records at most one completion per local day.
 */
public record CompleteDayRequest(
        @Positive(message = "Minutes must be positive.")
        @Max(value = 1440, message = "Minutes cannot exceed a full day (1440).")
        int minutes) {
}
