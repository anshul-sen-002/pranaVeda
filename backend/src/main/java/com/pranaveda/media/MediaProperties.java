package com.pranaveda.media;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Upload limits and accepted types (agents.md 2.15: validate uploads
 * server-side). Bound from {@code app.media.*}. Limits are defence-in-depth -
 * the controller also enforces the multipart size cap.
 */
@ConfigurationProperties(prefix = "app.media")
public record MediaProperties(
        long maxImageBytes,
        long maxVideoBytes,
        long maxAudioBytes,
        int maxImageDimension,
        long maxImagePixels,
        int maxAudioSeconds,
        List<String> allowedImageTypes,
        List<String> allowedVideoTypes,
        List<String> allowedAudioTypes) {

    public MediaProperties {
        if (maxImageBytes <= 0) {
            maxImageBytes = 5L * 1024 * 1024; // 5 MB
        }
        if (maxVideoBytes <= 0) {
            maxVideoBytes = 100L * 1024 * 1024; // 100 MB
        }
        if (maxAudioBytes <= 0) {
            maxAudioBytes = 50L * 1024 * 1024; // 50 MB
        }
        if (maxImageDimension <= 0) {
            maxImageDimension = 4096;
        }
        if (maxImagePixels <= 0) {
            maxImagePixels = 12_000_000L; // ~12 MP
        }
        if (maxAudioSeconds <= 0) {
            maxAudioSeconds = 3600; // 1 hour
        }
        if (allowedImageTypes == null || allowedImageTypes.isEmpty()) {
            allowedImageTypes = List.of("image/jpeg", "image/png", "image/webp", "image/avif");
        }
        if (allowedVideoTypes == null || allowedVideoTypes.isEmpty()) {
            allowedVideoTypes = List.of("video/mp4", "video/webm", "video/quicktime");
        }
        if (allowedAudioTypes == null || allowedAudioTypes.isEmpty()) {
            allowedAudioTypes = List.of("audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav");
        }
    }
}
