package com.pranaveda.content;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.pranaveda.common.error.NotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * The publication-visibility rule is a security rule (agents.md 2.4): drafts
 * and archived items must never leak through public APIs.
 */
class ContentServiceTest {

    private ContentRepository contentRepository;
    private ContentItemFacetRepository facetRepository;
    private ContentStepRepository stepRepository;
    private ContentService contentService;

    @BeforeEach
    void setUp() {
        contentRepository = mock(ContentRepository.class);
        facetRepository = mock(ContentItemFacetRepository.class);
        stepRepository = mock(ContentStepRepository.class);
        contentService = new ContentService(contentRepository, facetRepository, stepRepository);
        when(stepRepository.findByContentIdOrderByStepOrderAsc(any())).thenReturn(List.of());
    }

    @Test
    void publishedItemIsReturned() {
        ContentItem item = item(1L, ContentStatus.PUBLISHED);
        when(contentRepository.findBySlug("mountain-pose")).thenReturn(Optional.of(item));
        when(facetRepository.findByContentId(1L)).thenReturn(List.of(
            new ContentItemFacet(1L, FacetType.GOAL, Goal.POSTURE.name()),
            new ContentItemFacet(1L, FacetType.TARGET_AREA, "spine")));

        ContentDetail detail = contentService.getPublished("mountain-pose");

        assertThat(detail.id()).isEqualTo(1L);
        assertThat(detail.status()).isEqualTo(ContentStatus.PUBLISHED);
        assertThat(detail.targetAreas()).containsExactly("spine");
        assertThat(detail.summary().goals()).containsExactly("posture"); // lowercased for the API
    }

    @Test
    void draftItemIsInvisibleToThePublicApi() {
        when(contentRepository.findBySlug("secret-draft")).thenReturn(Optional.of(item(2L, ContentStatus.DRAFT)));

        NotFoundException ex = catchThrowableOfType(
            () -> contentService.getPublished("secret-draft"), NotFoundException.class);

        assertThat(ex.getMessage()).isEqualTo("Content not found.");
        verify(facetRepository, never()).findByContentId(2L);
    }

    @Test
    void archivedItemIsInvisibleToThePublicApi() {
        when(contentRepository.findBySlug("old-article")).thenReturn(Optional.of(item(3L, ContentStatus.ARCHIVED)));

        catchThrowableOfType(() -> contentService.getPublished("old-article"), NotFoundException.class);
    }

    @Test
    void unknownSlugReturnsNotFound() {
        when(contentRepository.findBySlug("nope")).thenReturn(Optional.empty());

        assertThat(catchThrowableOfType(() -> contentService.getPublished("nope"), NotFoundException.class))
            .isNotNull();
    }

    @Test
    void listLoadsFacetsForTheWholePageInOneQuery() {
        ContentItem item = item(7L, ContentStatus.PUBLISHED);
        var page = new org.springframework.data.domain.PageImpl<>(List.of(item));
        when(contentRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class),
                any(org.springframework.data.domain.Pageable.class))).thenReturn(page);
        when(facetRepository.findByContentIdIn(List.of(7L))).thenReturn(List.of(
            new ContentItemFacet(7L, FacetType.GOAL, Goal.FLEXIBILITY.name())));

        var result = contentService.list(query());

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).goals()).containsExactly("flexibility");
        verify(facetRepository).findByContentIdIn(List.of(7L));
    }

    private static ContentQuery query() {
        return new ContentQuery(null, null, null, null, null, List.of(), null, "newest", 0, 12);
    }

    private static ContentItem item(long id, ContentStatus status) {
        ContentItem item = new ContentItem();
        item.setSlug("item-" + id);
        item.setTitle("Item " + id);
        item.setContentType(ContentType.ASANA);
        item.setStatus(status);
        item.setPublishedAt(Instant.parse("2026-01-01T00:00:00Z"));
        org.springframework.test.util.ReflectionTestUtils.setField(item, "id", id);
        return item;
    }
}
