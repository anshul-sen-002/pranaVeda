package com.pranaveda.routine;

import java.time.Instant;

/**
 * Lightweight routine row for list views (agents.md 2.10). Omits the ordered
 * items to keep the list cheap; fetch a routine by id for its full sequence.
 */
public record RoutineSummaryDto(
        long id,
        String name,
        String description,
        boolean isPublic,
        int itemCount,
        Instant createdAt,
        Instant updatedAt) {

    static RoutineSummaryDto of(Routine routine, int itemCount) {
        return new RoutineSummaryDto(
                routine.getId(),
                routine.getName(),
                routine.getDescription(),
                routine.isPublic(),
                itemCount,
                routine.getCreatedAt(),
                routine.getUpdatedAt());
    }
}
