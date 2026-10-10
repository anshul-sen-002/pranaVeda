package com.pranaveda.audio;

import java.time.Instant;

/**
 * A single listening-history entry with best-effort track metadata (agents.md
 * 2.12). If the track was unpublished or deleted since the play, the metadata
 * fields are null and {@code trackId} remains so history never silently loses a
 * completed listen. Owner-scoped.
 */
public record ListenHistoryDto(
        Long id,
        Long trackId,
        String trackTitle,
        String trackSlug,
        String coverImageUrl,
        Integer secondsListened,
        Instant playedAt) {
}
