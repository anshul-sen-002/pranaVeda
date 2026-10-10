package com.pranaveda.media;

/**
 * Safe client view of a stored asset. Exposes only the delivery URL and
 * descriptive metadata - never the storage credentials or raw provider
 * response (architecture section 9).
 */
public record MediaDto(
        Long id,
        MediaKind kind,
        String url,
        String format,
        Long bytes,
        Integer width,
        Integer height,
        Double durationSecs) {

    static MediaDto from(MediaAsset asset) {
        return new MediaDto(
            asset.getId(),
            asset.getKind(),
            asset.getSecureUrl(),
            asset.getFormat(),
            asset.getBytes(),
            asset.getWidth(),
            asset.getHeight(),
            asset.getDurationSecs());
    }
}
