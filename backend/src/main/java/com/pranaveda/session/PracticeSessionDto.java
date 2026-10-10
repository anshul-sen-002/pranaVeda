package com.pranaveda.session;

import java.time.Instant;

import com.pranaveda.content.ContentSummary;

/**
 * Safe view of one recorded practice session. Owner-only.
 *
 * <p>{@code content} is a summary of the item that was practised, or null when
 * the session was a general practice or the referenced content has since been
 * deleted/unpublished. The session itself is preserved either way, so history
 * and totals never silently lose a completed practice (agents.md 2.9).
 */
public record PracticeSessionDto(
        Long id,
        Long contentId,
        ContentSummary content,
        Integer durationMinutes,
        Instant completedAt,
        String notes,
        Instant createdAt) {
}
