package com.pranaveda.challenge;

import java.util.List;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/** Milestone badges for the 7-day challenge (agents.md 2.11). */
class ChallengeBadgesTest {

    @Test
    void noDaysEarnsNoBadges() {
        assertThat(ChallengeBadges.earned(0, 7)).isEmpty();
    }

    @Test
    void firstDayEarnsFirstStep() {
        assertThat(ChallengeBadges.earned(1, 7)).containsExactly("First Step");
    }

    @Test
    void halfwayEarnsHalfwayBadge() {
        assertThat(ChallengeBadges.earned(4, 7)).contains("Halfway There");
    }

    @Test
    void finalStretchAndCompleteOnFullSeven() {
        List<String> badges = ChallengeBadges.earned(7, 7);

        assertThat(badges).contains("First Step", "Halfway There", "Final Stretch", "Challenge Complete");
    }

    @Test
    void nearEndEarnsFinalStretch() {
        assertThat(ChallengeBadges.earned(5, 7)).contains("Final Stretch");
    }

    @Test
    void shortChallengeStillHalfwayAtOneDay() {
        assertThat(ChallengeBadges.earned(1, 2)).contains("First Step", "Halfway There");
    }
}
