package com.pranaveda.media;

/**
 * Immutable reference to a stored object, produced by {@link StorageService}.
 * Contains only safe metadata - no credentials or storage internals. Persisted
 * into {@code media_assets} and exposed to clients as {@link MediaDto}.
 */
public record StoredMedia(
        String publicId,
        String secureUrl,
        String resourceType,
        String format,
        long bytes,
        Integer width,
        Integer height,
        Double durationSecs) {
}
