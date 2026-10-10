package com.pranaveda.media;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Cloudinary connection settings (architecture section 9). Bound from the
 * {@code app.cloudinary.*} namespace; in production every value is mandatory
 * and has no default, so a misconfigured deployment fails fast at startup.
 *
 * <p>The {@code CLOUDINARY_URL} environment variable is preferred when present
 * (the SDK reads it automatically); the discrete fields are the documented
 * fallback and are what {@link CloudinaryStorageService} configures explicitly.
 */
@ConfigurationProperties(prefix = "app.cloudinary")
public record CloudinaryProperties(
        String cloudName,
        String apiKey,
        String apiSecret,
        String folder) {

    public CloudinaryProperties {
        if (folder == null || folder.isBlank()) {
            folder = "pranaveda";
        }
    }

    public boolean isConfigured() {
        return cloudName != null && !cloudName.isBlank()
            && apiKey != null && !apiKey.isBlank()
            && apiSecret != null && !apiSecret.isBlank();
    }
}
