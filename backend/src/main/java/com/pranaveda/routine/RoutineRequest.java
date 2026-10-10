package com.pranaveda.routine;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Create/update body for a routine (agents.md 2.10). {@code items} is the full
 * ordered sequence: reordering is expressed by reordering this list, and saving
 * replaces the routine's items wholesale so the stored order always matches the
 * client exactly. A duplicate content id is rejected to avoid confusing repeats.
 */
public record RoutineRequest(

        @NotBlank(message = "Name is required.")
        @Size(max = 120, message = "Name must be at most 120 characters.")
        String name,

        @Size(max = 500, message = "Description must be at most 500 characters.")
        String description,

        @Valid
        List<RoutineItemRequest> items) {
}
