package com.pranaveda.challenge;

import java.util.ArrayList;
import java.util.List;

/**
 * Pure milestone-badge logic for the 7-day challenge (agents.md 2.11). Kept
 * free of Spring/JPA types so it is trivially unit-testable. Badges are earned
 * by cumulative completed days and are always encouraging.
 */
public final class ChallengeBadges {

    private ChallengeBadges() {
    }

    /** Returns the milestone labels earned for the given completed-day count. */
    public static List<String> earned(int completedDays, int durationDays) {
        List<String> badges = new ArrayList<>();
        if (completedDays >= 1) {
            badges.add("First Step");
        }
        int halfway = Math.max(1, (int) Math.ceil(durationDays / 2.0));
        if (completedDays >= halfway) {
            badges.add("Halfway There");
        }
        if (durationDays >= 5 && completedDays >= durationDays - 2) {
            badges.add("Final Stretch");
        }
        if (completedDays >= durationDays) {
            badges.add("Challenge Complete");
        }
        return badges;
    }
}
