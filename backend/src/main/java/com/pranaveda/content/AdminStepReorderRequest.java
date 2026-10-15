package com.pranaveda.content;

import java.util.List;

import jakarta.validation.constraints.Size;

/** Reorder payload: the full list of step ids for the content, in display order. */
public record AdminStepReorderRequest(
    @Size(max = ContentStep.MAX_STEPS) List<Long> stepIds) {
}
