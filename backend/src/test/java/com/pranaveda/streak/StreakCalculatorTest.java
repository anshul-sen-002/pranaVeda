package com.pranaveda.streak;

import java.time.LocalDate;
import java.util.Set;
import java.util.TreeSet;

import com.pranaveda.streak.StreakCalculator.StreakResult;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Streak arithmetic (agents.md 2.11). Covers the humane missed-day policy
 * (a streak survives an unfinished today but breaks after a full day is
 * missed), longest-run tracking, and empty history.
 */
class StreakCalculatorTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 1, 15);

    @Test
    void noPracticeDaysMeansZeroStreaks() {
        StreakResult result = StreakCalculator.compute(Set.of(), TODAY);

        assertThat(result.currentStreak()).isZero();
        assertThat(result.longestStreak()).isZero();
        assertThat(result.practisedToday()).isFalse();
        assertThat(result.practisedYesterday()).isFalse();
        assertThat(result.broken()).isTrue();
    }

    @Test
    void nullPracticeDaysTreatedAsEmpty() {
        StreakResult result = StreakCalculator.compute(null, TODAY);

        assertThat(result.currentStreak()).isZero();
        assertThat(result.broken()).isTrue();
    }

    @Test
    void practisingTodayCountsToday() {
        StreakResult result = StreakCalculator.compute(days(TODAY, TODAY.minusDays(1)), TODAY);

        assertThat(result.currentStreak()).isEqualTo(2);
        assertThat(result.practisedToday()).isTrue();
        assertThat(result.broken()).isFalse();
    }

    @Test
    void unfinishedTodayKeepsYesterdayStreakAlive() {
        // Practised the last three days but not yet today: streak stays alive.
        StreakResult result = StreakCalculator.compute(
                days(TODAY.minusDays(1), TODAY.minusDays(2), TODAY.minusDays(3)), TODAY);

        assertThat(result.currentStreak()).isEqualTo(3);
        assertThat(result.practisedToday()).isFalse();
        assertThat(result.practisedYesterday()).isTrue();
        assertThat(result.broken()).isFalse();
    }

    @Test
    void aFullyMissedDayBreaksTheStreak() {
        // Last practice was two days ago -> a whole day was missed.
        StreakResult result = StreakCalculator.compute(days(TODAY.minusDays(2)), TODAY);

        assertThat(result.currentStreak()).isZero();
        assertThat(result.broken()).isTrue();
    }

    @Test
    void gapResetsCurrentButKeepsLongest() {
        // A run of 4, then a gap, then today + yesterday (run of 2).
        Set<LocalDate> days = days(
                TODAY, TODAY.minusDays(1),
                TODAY.minusDays(5), TODAY.minusDays(6),
                TODAY.minusDays(7), TODAY.minusDays(8));

        StreakResult result = StreakCalculator.compute(days, TODAY);

        assertThat(result.currentStreak()).isEqualTo(2);
        assertThat(result.longestStreak()).isEqualTo(4);
        assertThat(result.broken()).isFalse();
    }

    @Test
    void longestStreakIsTrackedIndependentlyOfCurrent() {
        Set<LocalDate> days = days(
                TODAY.minusDays(10), TODAY.minusDays(11), TODAY.minusDays(12),
                TODAY.minusDays(13), TODAY.minusDays(14), TODAY);

        StreakResult result = StreakCalculator.compute(days, TODAY);

        assertThat(result.currentStreak()).isEqualTo(1);
        assertThat(result.longestStreak()).isEqualTo(5);
    }

    private static Set<LocalDate> days(LocalDate... dates) {
        return new TreeSet<>(Set.of(dates));
    }
}
