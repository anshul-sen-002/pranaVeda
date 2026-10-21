package com.pranaveda.content;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import com.pranaveda.category.CategoryDto;
import com.pranaveda.category.TagDto;

/** Maps ContentItem entities (with their facets) into read models. */
public final class ContentMapper {

    private ContentMapper() {
    }

    public static ContentSummary summary(ContentItem item, List<ContentItemFacet> facets) {
        return new ContentSummary(
            item.getId(),
            item.getSlug(),
            item.getTitle(),
            item.getSummary(),
            item.getContentType(),
            item.getDifficulty(),
            item.getDurationMinutes(),
            item.getCommonName(),
            item.getSanskritName(),
            item.getFeaturedImageUrl(),
            item.getFeaturedVideoUrl(),
            item.getStatus(),
            item.getCategories().stream().map(CategoryDto::from)
                .sorted(Comparator.comparing(CategoryDto::name)).toList(),
            item.getTags().stream().map(TagDto::from)
                .sorted(Comparator.comparing(TagDto::name)).toList(),
            facetValues(facets, FacetType.GOAL).stream().map(v -> v.toLowerCase(Locale.ROOT)).toList(),
            item.getPublishedAt());
    }

    public static ContentDetail detail(ContentItem item, List<ContentItemFacet> facets,
                                       List<ContentStep> steps) {
        return new ContentDetail(
            summary(item, facets),
            item.getDescription(),
            item.getInstructions(),
            item.getBreathingNotes(),
            item.getModifications(),
            item.getSafetyPrecautions(),
            item.getBenefits(),
            item.getEvidenceNotes(),
            item.getSeoTitle(),
            item.getSeoDescription(),
            facetValues(facets, FacetType.TARGET_AREA),
            steps == null ? List.of() : steps.stream().map(ContentStepDto::from).toList(),
            item.getCreatedAt(),
            item.getUpdatedAt(),
            item.getCreatedBy(),
            item.getUpdatedBy());
    }

    private static List<String> facetValues(List<ContentItemFacet> facets, FacetType type) {
        if (facets == null) {
            return List.of();
        }
        return facets.stream()
            .filter(facet -> facet.getFacetType() == type)
            .map(ContentItemFacet::getFacetValue)
            .sorted()
            .toList();
    }
}
