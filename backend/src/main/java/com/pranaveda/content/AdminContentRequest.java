package com.pranaveda.content;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Create/update payload for admin content endpoints. Slug is optional (a
 * slug is generated from the title when blank); status is intentionally
 * absent - items are always created as DRAFT and published explicitly.
 */
public record AdminContentRequest(
    @NotBlank @Size(max = 200) String title,
    @Size(max = 160) String slug,
    @Size(max = 500) String summary,
    String description,
    @Size(max = 120) String commonName,
    @Size(max = 160) String sanskritName,
    @NotNull ContentType contentType,
    Difficulty difficulty,
    @Min(1) @Max(1440) Integer durationMinutes,
    @Size(max = 500) String featuredImageUrl,
    @Size(max = 500) String featuredVideoUrl,
    String instructions,
    String breathingNotes,
    String modifications,
    String safetyPrecautions,
    String benefits,
    String evidenceNotes,
    @Size(max = 200) String seoTitle,
    @Size(max = 300) String seoDescription,
    @Size(max = 20) List<String> categorySlugs,
    @Size(max = 30) List<String> tagSlugs,
    @Size(max = 10) List<String> goals,
    @Size(max = 10) List<String> targetAreas) {
}

