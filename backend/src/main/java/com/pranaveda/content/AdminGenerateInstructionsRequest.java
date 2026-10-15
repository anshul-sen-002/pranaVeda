package com.pranaveda.content;

import java.util.List;

import jakarta.validation.constraints.Size;

/**
 * AI instruction generation payload. {@code stepIds} null/empty = every step;
 * {@code overwrite}=false only fills steps that have no narration yet.
 */
public record AdminGenerateInstructionsRequest(
    @Size(max = ContentStep.MAX_STEPS) List<Long> stepIds,
    boolean overwrite) {
}
