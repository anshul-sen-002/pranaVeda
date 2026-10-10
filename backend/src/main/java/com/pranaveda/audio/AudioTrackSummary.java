package com.pranaveda.audio;

import java.time.Instant;
import java.util.List;

/**
 * Public card view of an audio track (agents.md 2.12). Carries only what the
 * library UI needs - no storage keys, no admin-only fields. Duration drives
 * list formatting and queue estimates.
 */
public record AudioTrackSummary(
        Long id,
        String title,
        String slug,
        String description,
        AudioCategory category,
        Integer durationSeconds,
        String coverImageUrl,
        List<String> tags,
        Instant publishedAt) {
}
