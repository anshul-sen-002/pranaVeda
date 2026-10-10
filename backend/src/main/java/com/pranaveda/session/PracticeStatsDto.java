package com.pranaveda.session;

/**
 * Aggregate practice totals for the dashboard (agents.md 2.9). These are the
 * "practice minutes and completed sessions over a selected period" figures,
 * computed on the server. Feature #5 composes streak and challenge figures on
 * top of these for the full dashboard payload.
 *
 * <p>Windowed figures use simple rolling windows (now - 7 / 30 days). They
 * describe activity, never make health claims, and imply no correlation with
 * any wellness outcome (agents.md 2.9).
 *
 * @param totalSessions    all completed sessions ever recorded
 * @param totalMinutes     all practised minutes ever recorded
 * @param sessionsLast7Days  sessions in the trailing 7 days
 * @param minutesLast7Days   minutes in the trailing 7 days
 * @param sessionsLast30Days sessions in the trailing 30 days
 * @param minutesLast30Days  minutes in the trailing 30 days
 */
public record PracticeStatsDto(
        long totalSessions,
        long totalMinutes,
        long sessionsLast7Days,
        long minutesLast7Days,
        long sessionsLast30Days,
        long minutesLast30Days) {
}
