package com.pranaveda.challenge;

/**
 * Public view of a challenge definition (agents.md 2.11). Only PUBLISHED
 * challenges ever reach this DTO - drafts/archived are never exposed publicly.
 */
public record ChallengeDto(
        Long id,
        String slug,
        String title,
        String summary,
        String description,
        int durationDays,
        int dailyGoalMinutes) {

    static ChallengeDto from(Challenge challenge) {
        return new ChallengeDto(
                challenge.getId(),
                challenge.getSlug(),
                challenge.getTitle(),
                challenge.getSummary(),
                challenge.getDescription(),
                challenge.getDurationDays(),
                challenge.getDailyGoalMinutes());
    }
}
