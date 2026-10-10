package com.pranaveda.dashboard;

import java.util.List;

import com.pranaveda.challenge.ChallengeProgressDto;
import com.pranaveda.session.PracticeStatsDto;
import com.pranaveda.streak.StreakDto;

/**
 * One payload for the member dashboard (agents.md 2.9). Composes the headline
 * figures the dashboard shows in a single round-trip instead of many:
 *
 * <ul>
 *   <li>{@code streak} - current/longest streak (server-computed, humane)</li>
 *   <li>{@code practice} - totals and 7/30-day windows</li>
 *   <li>{@code savedCount} - number of bookmarked items</li>
 *   <li>{@code challenges} - the member's challenge progress</li>
 *   <li>{@code recentSaved} - the most recently saved items (preview)</li>
 * </ul>
 *
 * <p>Every field is owner-scoped: the service resolves the owner from the
 * security context and never surfaces another member's data. The figures
 * describe activity only - they carry no health claims and imply no causation
 * (agents.md 2.9).
 *
 * @param streak      current/longest streak snapshot
 * @param practice    practice totals and windows
 * @param savedCount  number of items the member has saved
 * @param challenges  challenge progress for each joined challenge
 * @param recentSaved the most recently saved items, for the dashboard preview
 */
public record DashboardDto(
        StreakDto streak,
        PracticeStatsDto practice,
        long savedCount,
        List<ChallengeProgressDto> challenges,
        List<com.pranaveda.bookmark.SavedItemDto> recentSaved) {
}
