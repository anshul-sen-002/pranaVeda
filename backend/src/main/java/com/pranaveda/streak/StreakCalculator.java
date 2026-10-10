package com.pranaveda.streak;

import java.time.LocalDate;
import java.util.Set;
import java.util.TreeSet;

/**
 * Pure streak arithmetic (agents.md 2.11). Kept free of any Spring/JPA types so
 * it is trivially unit-testable and the backend - never the frontend - is the
 * source of truth for streaks.
 *
 * <p>Humane missed-day policy: a streak is not considered broken merely because
 * the user has not practised <em>yet today</em>. It is only broken once a full
 * day has passed with no practice. The calculation is deterministic and driven
 * entirely by the distinct local practice days supplied by the caller.
 */
public final class StreakCalculator {

    private StreakCalculator() {
    }

    /**
     * Computes current and longest streaks from distinct practice days.
     *
     * @param practiceDays distinct local dates on which a practice was completed
     * @param today        the user's current local date (timezone-resolved by caller)
     */
    public static StreakResult compute(Set<LocalDate> practiceDays, LocalDate today) {
        TreeSet<LocalDate> days = new TreeSet<>(practiceDays == null ? Set.of() : practiceDays);

        boolean practisedToday = days.contains(today);
        boolean practisedYesterday = days.contains(today.minusDays(1));

        // The most recent day the streak is "earned through". Practising today
        // extends to today; otherwise a practice yesterday keeps it alive (grace)
        // without counting an unfinished today.
        LocalDate earnedThrough = practisedToday ? today
                : practisedYesterday ? today.minusDays(1)
                : null;

        int current = earnedThrough == null ? 0 : countConsecutiveBack(days, earnedThrough);
        int longest = longestRun(days);

        return new StreakResult(current, longest, practisedToday, practisedYesterday,
                earnedThrough == null);
    }

    private static int countConsecutiveBack(TreeSet<LocalDate> days, LocalDate start) {
        int streak = 0;
        LocalDate cursor = start;
        while (days.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private static int longestRun(TreeSet<LocalDate> days) {
        int longest = 0;
        int run = 0;
        LocalDate previous = null;
        for (LocalDate day : days) {
            run = (previous != null && previous.plusDays(1).equals(day)) ? run + 1 : 1;
            longest = Math.max(longest, run);
            previous = day;
        }
        return longest;
    }

    /**
     * Immutable result of a streak calculation.
     *
     * @param currentStreak      consecutive days ending today or yesterday
     * @param longestStreak      longest consecutive-day run on record
     * @param practisedToday     whether a practice was completed on the user's today
     * @param practisedYesterday whether a practice was completed yesterday
     * @param broken             true when neither today nor yesterday has a practice
     */
    public record StreakResult(int currentStreak, int longestStreak, boolean practisedToday,
                               boolean practisedYesterday, boolean broken) {
    }
}
