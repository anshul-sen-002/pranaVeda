package com.pranaveda.routine;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * One requested step when creating or replacing a routine (agents.md 2.10).
 * The service re-derives {@code position} from list order, so the client need
 * not send one - any supplied value is ignored and order is authoritative.
 */
public record RoutineItemRequest(

        @NotNull(message = "Content id is required.")
        Long contentId,

        @Positive(message = "Duration must be positive when provided.")
        Integer durationSeconds,

        @Size(max = 300, message = "Note must be at most 300 characters.")
        String note) {
}
