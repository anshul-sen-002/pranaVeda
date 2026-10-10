package com.pranaveda.routine;

import com.pranaveda.content.ContentSummary;

/**
 * Safe view of one routine step (agents.md 2.10). Embeds a lightweight content
 * summary so the UI can render the sequence without a follow-up lookup. If the
 * referenced content is later deleted/unpublished, {@code content} is null but
 * the step (with its note) is preserved.
 */
public record RoutineItemDto(
        long id,
        int position,
        Integer durationSeconds,
        String note,
        ContentSummary content) {
}
