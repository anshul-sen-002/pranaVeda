package com.pranaveda.content;

import java.time.Instant;
import java.util.List;

/** Full detail projection: card data plus long-form, guided-step and audit fields. */
public record ContentDetail(
    ContentSummary summary,
    String description,
    String instructions,
    String breathingNotes,
    String modifications,
    String safetyPrecautions,
    String benefits,
    String evidenceNotes,
    String seoTitle,
    String seoDescription,
    List<String> targetAreas,
    /** Ordered guided-slideshow steps; empty when the pose has none. */
    List<ContentStepDto> steps,
    Instant createdAt,
    Instant updatedAt,
    Long createdBy,
    Long updatedBy) {

    public Long id() {
        return summary.id();
    }

    public String slug() {
        return summary.slug();
    }

    public ContentStatus status() {
        return summary.status();
    }
}
