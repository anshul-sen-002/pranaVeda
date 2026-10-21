package com.pranaveda.content;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.pranaveda.bookmark.BookmarkRepository;
import com.pranaveda.category.Category;
import com.pranaveda.category.CategoryRepository;
import com.pranaveda.category.Tag;
import com.pranaveda.category.TagRepository;
import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.media.MediaAsset;
import com.pranaveda.media.MediaKind;
import com.pranaveda.media.MediaRepository;
import com.pranaveda.media.MediaService;
import com.pranaveda.common.error.ConflictException;
import com.pranaveda.common.error.ErrorCode;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.common.error.UnauthorizedException;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.user.Role;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Admin content studio rules (agents.md 2.15): items are always created as
 * DRAFT, publication is an explicit transition, and the acting editor comes
 * from the security context - never from the request body.
 */
class AdminContentServiceTest {

    private static final long ADMIN_ID = 42L;

    private ContentRepository contentRepository;
    private ContentItemFacetRepository facetRepository;
    private CategoryRepository categoryRepository;
    private TagRepository tagRepository;
    private ContentStepRepository stepRepository;
    private MediaRepository mediaRepository;
    private MediaService mediaService;
    private BookmarkRepository bookmarks;
    private AdminContentService service;

    @BeforeEach
    void setUp() {
        contentRepository = mock(ContentRepository.class);
        facetRepository = mock(ContentItemFacetRepository.class);
        categoryRepository = mock(CategoryRepository.class);
        tagRepository = mock(TagRepository.class);
        stepRepository = mock(ContentStepRepository.class);
        mediaRepository = mock(MediaRepository.class);
        mediaService = mock(MediaService.class);
        bookmarks = mock(BookmarkRepository.class);
        service = new AdminContentService(contentRepository, facetRepository, categoryRepository,
            tagRepository, stepRepository, mediaRepository, mediaService, bookmarks);

        authenticateAsAdmin();
        when(contentRepository.save(any(ContentItem.class))).thenAnswer(invocation -> {
            ContentItem item = invocation.getArgument(0);
            ReflectionTestUtils.setField(item, "id", 1L);
            return item;
        });
        when(facetRepository.findByContentId(anyLong())).thenReturn(List.of());
        when(facetRepository.findByContentIdIn(anyCollection())).thenReturn(List.of());
        when(stepRepository.findByContentIdOrderByStepOrderAsc(anyLong())).thenReturn(List.of());
        when(mediaRepository.findByContentIdAndKind(anyLong(), any(MediaKind.class)))
            .thenReturn(List.of());
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createAlwaysProducesADraft() {
        ContentDetail detail = service.create(request("Tree Pose", null, null, null, null, null));

        assertThat(detail.status()).isEqualTo(ContentStatus.DRAFT);
        assertThat(detail.slug()).isEqualTo("tree-pose");
        assertThat(detail.createdBy()).isEqualTo(ADMIN_ID);
        assertThat(detail.updatedBy()).isEqualTo(ADMIN_ID);
    }

    @Test
    void createWithoutAuthenticationFailsClosed() {
        SecurityContextHolder.clearContext();

        UnauthorizedException ex = catchThrowableOfType(
            () -> service.create(request("Tree Pose", null, null, null, null, null)),
            UnauthorizedException.class);

        assertThat(ex.code()).isEqualTo(ErrorCode.UNAUTHENTICATED);
        verify(contentRepository, never()).save(any());
    }

    @Test
    void createDerivesUniqueSlugWhenTitleIsTaken() {
        when(contentRepository.existsBySlug("tree-pose")).thenReturn(true);
        when(contentRepository.existsBySlug("tree-pose-2")).thenReturn(false);

        ContentDetail detail = service.create(request("Tree Pose", null, null, null, null, null));

        assertThat(detail.slug()).isEqualTo("tree-pose-2");
    }

    @Test
    void explicitSlugConflictIsAConflictNotASuffix() {
        when(contentRepository.existsBySlug("taken")).thenReturn(true);

        ConflictException ex = catchThrowableOfType(
            () -> service.create(request("Tree Pose", "taken", null, null, null, null)),
            ConflictException.class);

        assertThat(ex.getMessage()).contains("taken");
        assertThat(ex.code()).isEqualTo(ErrorCode.CONFLICT);
    }

    @Test
    void unknownCategorySlugIsRejected() {
        BadRequestException ex = catchThrowableOfType(
            () -> service.create(request("Tree Pose", null, List.of("ghost"), null, null, null)),
            BadRequestException.class);

        assertThat(ex.getMessage()).contains("Unknown category slugs: ghost");
    }

    @Test
    void unknownTagSlugIsRejected() {
        BadRequestException ex = catchThrowableOfType(
            () -> service.create(request("Tree Pose", null, null, List.of("ghost"), null, null)),
            BadRequestException.class);

        assertThat(ex.getMessage()).contains("Unknown tag slugs: ghost");
    }

    @Test
    void unknownGoalIsRejectedBeforeAnythingIsPersisted() {
        BadRequestException ex = catchThrowableOfType(
            () -> service.create(request("Tree Pose", null, null, null, List.of("enlightenment"), null)),
            BadRequestException.class);

        assertThat(ex.getMessage()).contains("Unknown goal filter: enlightenment");
    }

    @Test
    void validGoalsAreStoredAsFacetsAndTagsResolved() {
        when(categoryRepository.findBySlugIn(List.of("morning"))).thenReturn(List.of(category("morning")));
        when(tagRepository.findBySlugIn(List.of("beginner"))).thenReturn(List.of(tag("beginner")));

        ContentDetail detail = service.create(request(
            "Morning Flow", null, List.of("morning"), List.of("beginner"),
            List.of("relaxation"), List.of("Spine")));

        assertThat(detail.summary().categories()).extracting("slug").containsExactly("morning");
        assertThat(detail.summary().tags()).extracting("slug").containsExactly("beginner");
        verify(facetRepository).saveAll(anyList());
    }

    @Test
    void publishRecordsTheFirstPublicationTime() {
        ContentItem item = draft(1L);
        when(contentRepository.findById(1L)).thenReturn(Optional.of(item));

        ContentDetail published = service.publish(1L);
        assertThat(published.status()).isEqualTo(ContentStatus.PUBLISHED);
        Instant firstPublishedAt = item.getPublishedAt();
        assertThat(firstPublishedAt).isNotNull();

        // republishing an already-published item keeps the original date
        ContentDetail again = service.publish(1L);
        assertThat(again.status()).isEqualTo(ContentStatus.PUBLISHED);
        assertThat(item.getPublishedAt()).isEqualTo(firstPublishedAt);
    }

    @Test
    void unpublishReturnsToDraftAndArchiveIsItsOwnState() {
        ContentItem item = draft(1L);
        when(contentRepository.findById(1L)).thenReturn(Optional.of(item));

        assertThat(service.archive(1L).status()).isEqualTo(ContentStatus.ARCHIVED);
        assertThat(service.unpublish(1L).status()).isEqualTo(ContentStatus.DRAFT);
    }

    @Test
    void updateRecordsTheNewEditor() {
        ContentItem item = draft(1L);
        item.setCreatedBy(99L); // someone else created it
        when(contentRepository.findById(1L)).thenReturn(Optional.of(item));

        ContentDetail detail = service.update(1L, request("Renamed", null, null, null, null, null));

        assertThat(detail.summary().title()).isEqualTo("Renamed");
        assertThat(detail.createdBy()).isEqualTo(99L);
        assertThat(detail.updatedBy()).isEqualTo(ADMIN_ID);
    }

    @Test
    void updateIgnoresSlugWhenUnchanged() {
        ContentItem item = draft(1L);
        item.setSlug("tree-pose");
        when(contentRepository.findById(1L)).thenReturn(Optional.of(item));

        ContentDetail detail = service.update(1L, request("Tree Pose", "tree-pose", null, null, null, null));

        assertThat(detail.slug()).isEqualTo("tree-pose");
    }

    @Test
    void updateRejectsSlugOwnedByAnotherItem() {
        ContentItem item = draft(1L);
        item.setSlug("tree-pose");
        when(contentRepository.findById(1L)).thenReturn(Optional.of(item));
        when(contentRepository.existsBySlug("vrikshasana")).thenReturn(true);

        ConflictException ex = catchThrowableOfType(
            () -> service.update(1L, request("Tree Pose", "vrikshasana", null, null, null, null)),
            ConflictException.class);

        assertThat(ex.getMessage()).contains("vrikshasana");
    }

    @Test
    void getUnknownIdReturnsNotFound() {
        when(contentRepository.findById(404L)).thenReturn(Optional.empty());

        assertThat(catchThrowableOfType(() -> service.get(404L), NotFoundException.class)).isNotNull();
    }

    @Test
    void publishIsBlockedWhileAnyStepHasNoNarration() {
        ContentItem item = draft(1L);
        when(contentRepository.findById(1L)).thenReturn(Optional.of(item));
        ContentStep missing = new ContentStep();
        missing.setCaption("Step 1");
        when(stepRepository.findByContentIdOrderByStepOrderAsc(1L)).thenReturn(List.of(missing));

        BadRequestException ex = catchThrowableOfType(() -> service.publish(1L), BadRequestException.class);

        assertThat(ex.getMessage()).contains("Step 1 has no narration");
        assertThat(item.getStatus()).isEqualTo(ContentStatus.DRAFT);
    }

    @Test
    void publishSucceedsWhenEveryStepHasNarration() {
        ContentItem item = draft(1L);
        when(contentRepository.findById(1L)).thenReturn(Optional.of(item));
        ContentStep ready = new ContentStep();
        ready.setInstruction("Stand tall and breathe.");
        when(stepRepository.findByContentIdOrderByStepOrderAsc(1L)).thenReturn(List.of(ready));

        assertThat(service.publish(1L).status()).isEqualTo(ContentStatus.PUBLISHED);
    }

    // --- helpers -------------------------------------------------------------

    private static AdminContentRequest request(String title, String slug, List<String> categorySlugs,
                                               List<String> tagSlugs, List<String> goals, List<String> targetAreas) {
        return new AdminContentRequest(title, slug, "Summary", "Description", null, null,
            ContentType.ASANA, Difficulty.BEGINNER, 10, null, null, null, null, null, null, null,
            null, null, null, categorySlugs, tagSlugs, goals, targetAreas);
    }

    private static ContentItem draft(long id) {
        ContentItem item = new ContentItem();
        item.setSlug("draft-" + id);
        item.setTitle("Draft");
        item.setContentType(ContentType.ASANA);
        item.setStatus(ContentStatus.DRAFT);
        ReflectionTestUtils.setField(item, "id", id);
        return item;
    }

    private static Category category(String slug) {
        Category category = new Category();
        category.setSlug(slug);
        category.setName(slug);
        ReflectionTestUtils.setField(category, "id", 5L);
        return category;
    }

    private static Tag tag(String slug) {
        Tag tag = new Tag();
        tag.setSlug(slug);
        tag.setName(slug);
        ReflectionTestUtils.setField(tag, "id", 6L);
        return tag;
    }

    private static void authenticateAsAdmin() {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                new CurrentUserPrincipal(ADMIN_ID, "admin@pranaveda.dev", Role.ADMIN),
                null,
                List.of(() -> "ROLE_ADMIN")));
    }
}
