package com.pranaveda.content;

import java.time.Instant;

/**
 * Safe read model for one guided step. Shared by the public detail endpoint
 * (published items only) and the admin studio; never exposes the storage
 * public id or any provider metadata.
 */
public record ContentStepDto(
    Long id,
    int stepOrder,
    String imageUrl,
    String caption,
    String instruction,
    InstructionSource instructionSource,
    Instant updatedAt) {

    public static ContentStepDto from(ContentStep step) {
        return new ContentStepDto(
            step.getId(),
            step.getStepOrder(),
            step.getImageUrl(),
            step.getCaption(),
            step.getInstruction(),
            step.getInstructionSource(),
            step.getUpdatedAt());
    }
}
