package com.pranaveda.category;

import java.util.List;
import java.util.Optional;

import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.ConflictException;
import com.pranaveda.common.error.NotFoundException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Category/tag reads and the slug rules behind admin taxonomy writes. */
class TaxonomyServiceTest {

    private CategoryRepository categories;
    private TagRepository tags;
    private TaxonomyService service;

    @BeforeEach
    void setUp() {
        categories = mock(CategoryRepository.class);
        tags = mock(TagRepository.class);
        service = new TaxonomyService(categories, tags);
        when(categories.save(any(Category.class))).thenAnswer(invocation -> {
            Category saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 7L); // mimics the generated identity
            return saved;
        });
        when(tags.save(any(Tag.class))).thenAnswer(invocation -> {
            Tag saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "id", 8L);
            return saved;
        });
    }

    @Test
    void categoryListIsSortedByName() {
        when(categories.findAllByOrderByNameAsc())
            .thenReturn(List.of(category(1L, "backbends"), category(2L, "morning")));

        assertThat(service.listCategories()).extracting(CategoryDto::name)
            .containsExactly("backbends", "morning");
    }

    @Test
    void tagListIsSortedByName() {
        when(tags.findAllByOrderByNameAsc()).thenReturn(List.of(tag(1L, "beginner"), tag(2L, "gentle")));

        assertThat(service.listTags()).extracting(TagDto::slug).containsExactly("beginner", "gentle");
    }

    @Test
    void categorySlugIsDerivedFromNameWhenOmitted() {
        CategoryDto created = service.createCategory(
            new AdminTaxonomyRequest("Morning Yoga", "  ", "Start the day"));

        assertThat(created.slug()).isEqualTo("morning-yoga");
        assertThat(created.description()).isEqualTo("Start the day");
    }

    @Test
    void requestedSlugIsUsedAndSlugified() {
        CategoryDto created = service.createCategory(new AdminTaxonomyRequest("Backbends", "Deep Backbends", null));

        assertThat(created.slug()).isEqualTo("deep-backbends");
    }

    @Test
    void duplicateCategorySlugIsAConflict() {
        when(categories.existsBySlug("morning")).thenReturn(true);

        ConflictException ex = catchThrowableOfType(
            () -> service.createCategory(new AdminTaxonomyRequest("Morning", "morning", null)),
            ConflictException.class);

        assertThat(ex.getMessage()).contains("morning");
    }

    @Test
    void underivableSlugIsRejected() {
        BadRequestException ex = catchThrowableOfType(
            () -> service.createTag(new AdminTaxonomyRequest("!!!", "  !!! ", null)),
            BadRequestException.class);

        assertThat(ex.getMessage()).contains("Cannot derive a slug");
    }

    @Test
    void updatePreservesTheSlugSoPublicUrlsStayStable() {
        Category existing = category(3L, "morning");
        when(categories.findById(3L)).thenReturn(Optional.of(existing));

        // renaming the display name must NOT silently change the public URL
        CategoryDto updated = service.updateCategory(3L, new AdminTaxonomyRequest("Morning Yoga", null, null));

        assertThat(updated.slug()).isEqualTo("morning");
        assertThat(updated.name()).isEqualTo("Morning Yoga");
        verify(categories, never()).existsBySlug(anyString());
    }

    @Test
    void updateAcceptsAnExplicitSlugChange() {
        Category existing = category(3L, "morning");
        when(categories.findById(3L)).thenReturn(Optional.of(existing));
        when(categories.existsBySlug("morning-yoga")).thenReturn(false);

        CategoryDto updated = service.updateCategory(3L, new AdminTaxonomyRequest("Morning Yoga", "morning-yoga", null));

        assertThat(updated.slug()).isEqualTo("morning-yoga");
    }

    @Test
    void updateRejectsSlugCollisionWithAnotherRecord() {
        Category existing = category(3L, "morning");
        when(categories.findById(3L)).thenReturn(Optional.of(existing));
        when(categories.existsBySlug("taken")).thenReturn(true);

        ConflictException ex = catchThrowableOfType(
            () -> service.updateCategory(3L, new AdminTaxonomyRequest("Morning", "taken", null)),
            ConflictException.class);

        assertThat(ex.getMessage()).contains("taken");
    }

    @Test
    void updateUnknownCategoryReturnsNotFound() {
        when(categories.findById(9L)).thenReturn(Optional.empty());

        assertThat(catchThrowableOfType(
            () -> service.updateCategory(9L, new AdminTaxonomyRequest("X", null, null)),
            NotFoundException.class)).isNotNull();
    }

    @Test
    void tagCreateAndUpdateWork() {
        TagDto created = service.createTag(new AdminTaxonomyRequest("Gentle Flow", null, null));
        assertThat(created.slug()).isEqualTo("gentle-flow");

        Tag existing = tag(4L, "gentle-flow");
        when(tags.findById(4L)).thenReturn(Optional.of(existing));
        when(tags.existsBySlug("gentle-flow")).thenReturn(false);

        TagDto updated = service.updateTag(4L, new AdminTaxonomyRequest("Gentle Flow", "gentle-flow", null));
        assertThat(updated.slug()).isEqualTo("gentle-flow");
        assertThat(updated.name()).isEqualTo("Gentle Flow");
    }

    @Test
    void duplicateTagSlugIsAConflict() {
        when(tags.existsBySlug("gentle-flow")).thenReturn(true);

        ConflictException ex = catchThrowableOfType(
            () -> service.createTag(new AdminTaxonomyRequest("Gentle Flow", "gentle-flow", null)),
            ConflictException.class);

        assertThat(ex.getMessage()).contains("gentle-flow");
    }

    private static Category category(long id, String slug) {
        Category category = new Category();
        category.setSlug(slug);
        category.setName(slug);
        ReflectionTestUtils.setField(category, "id", id);
        return category;
    }

    private static Tag tag(long id, String slug) {
        Tag tag = new Tag();
        tag.setSlug(slug);
        tag.setName(slug);
        ReflectionTestUtils.setField(tag, "id", id);
        return tag;
    }
}
