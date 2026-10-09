package com.pranaveda.content;

import java.util.List;

import com.pranaveda.common.error.BadRequestException;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

/**
 * Validation/normalization of content list parameters (agents.md 2.5):
 * unknown sort keys are rejected, free text is trimmed, sizes are clamped,
 * and every sort has a deterministic id tie-breaker.
 */
class ContentQueryTest {

    @Test
    void unknownSortIsRejected() {
        BadRequestException ex = catchThrowableOfType(
            () -> query("q", "bogus").normalized(), BadRequestException.class);

        assertThat(ex.getMessage()).contains("Unknown sort 'bogus'");
        assertThat(ex.getMessage()).contains("newest");
    }

    @Test
    void blankSortDefaultsToNewest() {
        assertThat(query(null, null).normalized().sort()).isEqualTo("newest");
        assertThat(query("   ", null).normalized().sort()).isEqualTo("newest");
    }

    @Test
    void sizeIsClampedAndPageNeverNegative() {
        ContentQuery normalized = new ContentQuery(
            null, null, null, null, null, List.of(), null, "newest", -5, 999).normalized();

        assertThat(normalized.page()).isZero();
        assertThat(normalized.size()).isEqualTo(ContentQuery.MAX_SIZE);
    }

    @Test
    void freeTextAndFiltersAreTrimmedAndLowered() {
        ContentQuery normalized = new ContentQuery(
            "  Mountain  ", null, null, null, "  Morning ",
            List.of(" Beginner ", "beginner", ""), null, "newest", 0, 12).normalized();

        assertThat(normalized.q()).isEqualTo("Mountain");
        assertThat(normalized.category()).isEqualTo("morning");
        assertThat(normalized.tags()).containsExactly("beginner");
    }

    @Test
    void sortHasDeterministicTieBreaker() {
        Sort newest = query(null, "newest").normalized().toSort("publishedAt");

        assertThat(newest.getOrderFor("publishedAt").getDirection()).isEqualTo(Sort.Direction.DESC);
        assertThat(newest.getOrderFor("id").getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void titleSortOrdersAscending() {
        Sort sort = query(null, "title_asc").normalized().toSort("createdAt");

        assertThat(sort.getOrderFor("title").getDirection()).isEqualTo(Sort.Direction.ASC);
        assertThat(sort.getOrderFor("id").getDirection()).isEqualTo(Sort.Direction.ASC);
    }

    @Test
    void adminListSortsByCreatedAt() {
        Sort oldest = query(null, "oldest").normalized().toSort("createdAt");

        assertThat(oldest.getOrderFor("createdAt").getDirection()).isEqualTo(Sort.Direction.ASC);
    }

    @Test
    void likeWildcardsInSearchAreEscaped() {
        assertThat(ContentSpecification.escapeLike("100%")).isEqualTo("100\\%");
        assertThat(ContentSpecification.escapeLike("a_b")).isEqualTo("a\\_b");
        assertThat(ContentSpecification.escapeLike("back\\slash")).isEqualTo("back\\\\slash");
    }

    private static ContentQuery query(String q, String sort) {
        return new ContentQuery(q, null, null, null, null, List.of(), null, sort, 0, 12);
    }
}
