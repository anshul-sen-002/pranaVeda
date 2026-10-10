package com.pranaveda.streak;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * Streak view for the dashboard (agents.md 2.11). Computed on the server from
 * the user's recorded practice days - the frontend never derives streaks.
 *
 * <p>All figures are encouraging, never punitive: a streak is only "broken"
 * after a full day passes with no practice, not merely because today is still
 * unfinished. {@code broken=true} simply means the current streak has ended; it
 * carries no shaming language for the UI to render.
 *
 * @param currentStreak      consecutive practice days ending today or yesterday
 * @param longestStreak      longest consecutive-day run on record
 * @param practisedToday     whether a practice was logged on the user's today
 * @param practisedYesterday whether a practice was logged yesterday
 * @param broken             true when neither today nor yesterday has a practice
 * @param timezone           the IANA zone id used for day boundaries
 * @param today              the user's current local date used for the calculation
 */
public record StreakDto(
        int currentStreak,
        int longestStreak,
        boolean practisedToday,
        boolean practisedYesterday,
        boolean broken,
        String timezone,
        LocalDate today) {

    /** Fallback zone when the user has not set (or set an invalid) timezone. */
    static final ZoneId DEFAULT_ZONE = ZoneId.of("UTC");
}
