package com.pranaveda.challenge;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

/**
 * A member's challenge progress (agents.md 2.11): completion status, the
 * calendar history of completed days, and humane milestone badges. All fields
 * are owner-scoped and encouraging - nothing here shames a missed day.
 *
 * @param completedDays      distinct days completed (never double-counts)
 * @param durationDays       total days in the challenge
 * @param completed          true once all days are done
 * @param practiceDates      the calendar dates completed, ascending (history)
 * @param badges             milestone labels earned so far
 */
public record ChallengeProgressDto(
        Long participationId,
        Long challengeId,
        String challengeTitle,
        String challengeSlug,
        int completedDays,
        int durationDays,
        int dailyGoalMinutes,
        boolean completed,
        Instant startedAt,
        List<LocalDate> practiceDates,
        List<String> badges) {

    static ChallengeProgressDto of(Challenge challenge,
                                   ChallengeParticipation participation,
                                   List<LocalDate> practiceDates,
                                   List<String> badges) {
        int completedDays = practiceDates.size();
        return new ChallengeProgressDto(
                participation.getId(),
                challenge.getId(),
                challenge.getTitle(),
                challenge.getSlug(),
                completedDays,
                challenge.getDurationDays(),
                challenge.getDailyGoalMinutes(),
                completedDays >= challenge.getDurationDays(),
                participation.getStartedAt(),
                practiceDates,
                badges);
    }
}
