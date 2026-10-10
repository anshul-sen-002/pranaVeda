package com.pranaveda.audio;

/**
 * Result of a favorite/unfavorite toggle (agents.md 2.12). The UI uses
 * {@code favorite} for immediate, reversible state and {@code count} for an
 * optional popularity hint. Owner-scoped: always reflects the caller's own
 * favorites.
 */
public record FavoriteStatusDto(
        Long trackId,
        boolean favorite,
        long count) {
}
