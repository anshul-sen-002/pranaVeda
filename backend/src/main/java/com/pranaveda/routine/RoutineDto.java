package com.pranaveda.routine;

import java.time.Instant;
import java.util.List;

/**
 * Safe view of a routine with its ordered items (agents.md 2.10). Owner-only:
 * the service always resolves the routine under the caller's user id. The item
 * order is authoritative as stored.
 */
public record RoutineDto(
        long id,
        String name,
        String description,
        boolean isPublic,
        int itemCount,
        List<RoutineItemDto> items,
        Instant createdAt,
        Instant updatedAt) {
}
