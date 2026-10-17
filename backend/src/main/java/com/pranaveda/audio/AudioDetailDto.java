package com.pranaveda.audio;

/**
 * Public detail view of a published audio track (agents.md 2.12). The playable
 * {@code streamUrl} is resolved server-side from the referenced media asset's
 * secure URL (public streaming, no login). {@code downloadable} advertises
 * whether a download control should be shown; actual download authorization is
 * enforced by the backend, never inferred from this flag alone. No storage keys
 * or admin-only fields are exposed.
 */
public record AudioDetailDto(
        Long id,
        String title,
        String slug,
        String description,
        AudioCategory category,
        Integer durationSeconds,
        String coverImageUrl,
        String streamUrl,
        boolean downloadable,
        java.util.List<String> tags,
        String creator,
        String license,
        AudioStatus status,
        java.time.Instant publishedAt) {
}
