package com.pranaveda.audio;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * Records that the member started/played a track (agents.md 2.12). Client
 * input is untrusted: the track id must be positive and any reported listen
 * duration is clamped, so history cannot be poisoned with nonsense values.
 */
public record ListenRequest(
        @NotNull @Positive Long trackId,
        @Min(0) Integer secondsListened) {
}
