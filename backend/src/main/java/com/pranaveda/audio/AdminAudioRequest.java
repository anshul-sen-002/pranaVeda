package com.pranaveda.audio;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Create/update payload for admin audio endpoints. Tracks are always created
 * as DRAFT and published explicitly, mirroring the content lifecycle. Asset
 * ids reference rows in {@code media_assets} (uploaded first via
 * {@code POST /api/v1/admin/media}) - never raw URLs or storage keys.
 */
public record AdminAudioRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 200) String slug,
        @Size(max = 2000) String description,
        @NotNull AudioCategory category,
        @Min(0) @Max(7200) Integer durationSecs,
        @Size(max = 500) String tags,
        Long audioAssetId,
        Long coverAssetId,
        boolean streamable,
        boolean downloadable,
        @Size(max = 200) String creator,
        @Size(max = 200) String license,
        @Size(max = 500) String attribution) {
    public AdminAudioRequest {
        if (tags != null && tags.isBlank()) {
            tags = null;
        }
    }

    /** Comma-separated tags split into a trimmed, non-empty list. */
    public List<String> tagList() {
        if (tags == null || tags.isBlank()) {
            return List.of();
        }
        return java.util.Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
