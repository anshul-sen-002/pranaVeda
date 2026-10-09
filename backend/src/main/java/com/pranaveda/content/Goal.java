package com.pranaveda.content;

import com.pranaveda.common.error.BadRequestException;

import java.util.Arrays;

/**
 * Intended-goal whitelist from agents.md 2.5. Values are stored uppercase in
 * content_item_facets.facet_value and exposed lowercase in DTOs.
 */
public enum Goal {
    FLEXIBILITY,
    RELAXATION,
    BALANCE,
    MOBILITY,
    POSTURE,
    SLEEP_ROUTINE,
    GENERAL_FITNESS;

    /** Lowercase API/DB representation, e.g. {@code sleep_routine}. */
    public String apiValue() {
        return name().toLowerCase();
    }

    public static Goal fromApiValue(String value) {
        return Arrays.stream(values())
            .filter(goal -> goal.apiValue().equals(value))
            .findFirst()
            .orElseThrow(() -> new BadRequestException("Unknown goal filter: " + value));
    }
}
