package com.pranaveda.content;

import jakarta.validation.constraints.Size;

/**
 * Edit payload for one step. A {@code null} field leaves the value unchanged;
 * a blank string clears it. When the instruction changes, its source is reset
 * to {@link InstructionSource#ADMIN} (an admin edit always supersedes a draft).
 */
public record AdminStepUpdateRequest(
    @Size(max = 300) String caption,
    @Size(max = 2000) String instruction) {
}
