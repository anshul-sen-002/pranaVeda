package com.pranaveda.media;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Storage provider selection. Bound from {@code app.storage.*}.
 *
 * <p>Local disk storage keeps admin uploads working in development without
 * Cloudinary credentials. Switch to {@code cloudinary} in production.
 */
@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(
        String provider,        // "cloudinary" or "local"
        String uploadDir        // local disk directory for stored files
) {

    public StorageProperties {
        provider = provider == null || provider.isBlank() ? "cloudinary" : provider;
        uploadDir = uploadDir == null || uploadDir.isBlank() ? "uploads" : uploadDir;
    }
}