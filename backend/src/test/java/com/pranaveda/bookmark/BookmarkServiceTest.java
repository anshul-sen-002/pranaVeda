package com.pranaveda.bookmark;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import com.pranaveda.common.dto.PageResponse;
import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.common.error.UnauthorizedException;
import com.pranaveda.content.ContentItem;
import com.pranaveda.content.ContentItemFacetRepository;
import com.pranaveda.content.ContentRepository;
import com.pranaveda.content.ContentStatus;
import com.pranaveda.content.ContentType;
import com.pranaveda.security.CurrentUserPrincipal;
import com.pranaveda.user.Role;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Saved Library rules (agents.md 2.6): save/unsave/list are scoped to the
 * signed-in user, resolved from the security context; duplicate saves are
 * prevented; drafts/archived content cannot be saved; deleted/unpublished
 * saved items surface with {@code available=false}.
 */
class BookmarkServiceTest {

    private static final long USER_ID = 7L;
    private static final long CONTENT_ID = 11L;

    private BookmarkRepository bookmarks;
    private ContentRepository contentRepository;
    private ContentItemFacetRepository facetRepository;
    private BookmarkService service;

    @BeforeEach
    void setUp() {
        bookmarks = mock(BookmarkRepository.class);
        contentRepository = mock(ContentRepository.class);
        facetRepository = mock(ContentItemFacetRepository.class);
        service = new BookmarkService(bookmarks, contentRepository, facetRepository);

        authenticateAsUser();
        when(bookmarks.existsByUserIdAndTargetTypeAndTargetId(USER_ID,
                BookmarkTarget.CONTENT, CONTENT_ID)).thenReturn(false);
        when(bookmarks.countByUserId(USER_ID)).thenReturn(0L);
        when(contentRepository.findById(CONTENT_ID)).thenReturn(Optional.of(publishedItem(CONTENT_ID)));
        when(facetRepository.findByContentIdIn(anyCollection())).thenReturn(List.of());
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    // --- save ----------------------------------------------------------------

    @Test
    void savePublishedContentCreatesBookmark() {
        Bookmark saved = new Bookmark(USER_ID, BookmarkTarget.CONTENT, CONTENT_ID,
            ContentType.ASANA);
        ReflectionTestUtils.setField(saved, "id", 1L);
        when(bookmarks.findByUserIdAndTargetTypeAndTargetId(USER_ID,
                BookmarkTarget.CONTENT, CONTENT_ID)).thenReturn(Optional.empty());
        when(bookmarks.save(any(Bookmark.class))).thenReturn(saved);

        SavedItemDto dto = service.save(new BookmarkRequest(BookmarkTarget.CONTENT, CONTENT_ID));

        assertThat(dto.targetType()).isEqualTo(BookmarkTarget.CONTENT);
        assertThat(dto.targetId()).isEqualTo(CONTENT_ID);
        // Save resolves content type only; availability is resolved on list.
        assertThat(dto.available()).isFalse();
        assertThat(dto.content()).isNull();
        verify(bookmarks).save(any(Bookmark.class));
    }

    @Test
    void saveIsIdempotentReturnsExistingBookmark() {
        Bookmark existing = new Bookmark(USER_ID, BookmarkTarget.CONTENT, CONTENT_ID,
            ContentType.ASANA);
        ReflectionTestUtils.setField(existing, "id", 1L);
        when(bookmarks.findByUserIdAndTargetTypeAndTargetId(USER_ID,
                BookmarkTarget.CONTENT, CONTENT_ID)).thenReturn(Optional.of(existing));

        SavedItemDto dto = service.save(new BookmarkRequest(BookmarkTarget.CONTENT, CONTENT_ID));

        assertThat(dto.targetId()).isEqualTo(CONTENT_ID);
        verify(bookmarks, never()).save(any(Bookmark.class));
    }

    @Test
    void saveDraftContentReturnsNotFound() {
        when(contentRepository.findById(CONTENT_ID)).thenReturn(Optional.of(draftItem(CONTENT_ID)));

        assertThat(catchThrowableOfType(
            () -> service.save(new BookmarkRequest(BookmarkTarget.CONTENT, CONTENT_ID)),
            NotFoundException.class))
            .isNotNull();
        verify(bookmarks, never()).save(any(Bookmark.class));
    }

    @Test
    void saveUnknownContentReturnsNotFound() {
        when(contentRepository.findById(CONTENT_ID)).thenReturn(Optional.empty());

        assertThat(catchThrowableOfType(
            () -> service.save(new BookmarkRequest(BookmarkTarget.CONTENT, CONTENT_ID)),
            NotFoundException.class))
            .isNotNull();
        verify(bookmarks, never()).save(any(Bookmark.class));
    }

    @Test
    void saveAudioIsRejectedUntilLibraryExists() {
        assertThat(catchThrowableOfType(
            () -> service.save(new BookmarkRequest(BookmarkTarget.AUDIO, CONTENT_ID)),
            BadRequestException.class))
            .isNotNull();
    }

    @Test
    void saveRequiresAuthentication() {
        SecurityContextHolder.clearContext();

        assertThat(catchThrowableOfType(
            () -> service.save(new BookmarkRequest(BookmarkTarget.CONTENT, CONTENT_ID)),
            UnauthorizedException.class))
            .isNotNull();
    }

    // --- remove --------------------------------------------------------------

    @Test
    void removeDeletesTheUsersOwnBookmark() {
        when(bookmarks.existsByUserIdAndTargetTypeAndTargetId(USER_ID,
                BookmarkTarget.CONTENT, CONTENT_ID)).thenReturn(true);

        service.remove(BookmarkTarget.CONTENT, CONTENT_ID);

        verify(bookmarks).deleteByUserIdAndTargetTypeAndTargetId(USER_ID,
            BookmarkTarget.CONTENT, CONTENT_ID);
    }

    @Test
    void removeIsIdempotentWhenAbsent() {
        when(bookmarks.existsByUserIdAndTargetTypeAndTargetId(USER_ID,
                BookmarkTarget.CONTENT, CONTENT_ID)).thenReturn(false);

        service.remove(BookmarkTarget.CONTENT, CONTENT_ID); // no exception

        verify(bookmarks).deleteByUserIdAndTargetTypeAndTargetId(USER_ID,
            BookmarkTarget.CONTENT, CONTENT_ID);
    }

    // --- exists --------------------------------------------------------------

    @Test
    void existsReturnsTrueWhenSaved() {
        when(bookmarks.existsByUserIdAndTargetTypeAndTargetId(USER_ID,
                BookmarkTarget.CONTENT, CONTENT_ID)).thenReturn(true);

        assertThat(service.exists(BookmarkTarget.CONTENT, CONTENT_ID)).isTrue();
    }

    @Test
    void existsReturnsFalseWhenNotSaved() {
        when(bookmarks.existsByUserIdAndTargetTypeAndTargetId(USER_ID,
                BookmarkTarget.CONTENT, CONTENT_ID)).thenReturn(false);

        assertThat(service.exists(BookmarkTarget.CONTENT, CONTENT_ID)).isFalse();
    }

    // --- countMine -----------------------------------------------------------

    @Test
    void countMineReturnsTheUsersSavedCount() {
        when(bookmarks.countByUserId(USER_ID)).thenReturn(3L);

        assertThat(service.countMine()).isEqualTo(3L);
    }

    // --- list ----------------------------------------------------------------

    @Test
    void listReturnsSavedItemsWithPagination() {
        Bookmark bookmark = new Bookmark(USER_ID, BookmarkTarget.CONTENT, CONTENT_ID,
            ContentType.ASANA);
        ReflectionTestUtils.setField(bookmark, "id", 1L);
        Page<Bookmark> page = new PageImpl<>(List.of(bookmark),
            PageRequest.of(0, 20), 1);
        when(bookmarks.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(page);
        when(contentRepository.findAllById(List.of(CONTENT_ID)))
            .thenReturn(List.of(publishedItem(CONTENT_ID)));

        PageResponse<SavedItemDto> result = service.list(null, null, "newest", 0, 20);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).targetId()).isEqualTo(CONTENT_ID);
        assertThat(result.content().get(0).available()).isTrue();
        assertThat(result.totalElements()).isEqualTo(1);
    }

    @Test
    void listFiltersByTargetType() {
        when(bookmarks.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        service.list(BookmarkTarget.CONTENT, null, "newest", 0, 20);

        verify(bookmarks).findAll(any(Specification.class), any(PageRequest.class));
    }

    @Test
    void listFiltersByContentType() {
        when(bookmarks.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        service.list(null, ContentType.ASANA, "newest", 0, 20);

        verify(bookmarks).findAll(any(Specification.class), any(PageRequest.class));
    }

    @Test
    void listSortsNewestFirstByDefault() {
        when(bookmarks.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        service.list(null, null, "newest", 0, 20);

        verify(bookmarks).findAll(any(Specification.class),
            argThat(argThatDescending("createdAt")));
    }

    @Test
    void listSortsOldestFirstWhenRequested() {
        when(bookmarks.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        service.list(null, null, "oldest", 0, 20);

        verify(bookmarks).findAll(any(Specification.class),
            argThat(argThatAscending("createdAt")));
    }

    @Test
    void listUnpublishedContentMarkedUnavailable() {
        Bookmark bookmark = new Bookmark(USER_ID, BookmarkTarget.CONTENT, CONTENT_ID,
            ContentType.ASANA);
        ReflectionTestUtils.setField(bookmark, "id", 1L);
        Page<Bookmark> page = new PageImpl<>(List.of(bookmark),
            PageRequest.of(0, 20), 1);
        when(bookmarks.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(page);
        when(contentRepository.findAllById(List.of(CONTENT_ID)))
            .thenReturn(List.of(draftItem(CONTENT_ID)));

        PageResponse<SavedItemDto> result = service.list(null, null, "newest", 0, 20);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).available()).isFalse();
        assertThat(result.content().get(0).content()).isNull();
    }

    @Test
    void listDeletedContentMarkedUnavailable() {
        Bookmark bookmark = new Bookmark(USER_ID, BookmarkTarget.CONTENT, CONTENT_ID,
            ContentType.ASANA);
        ReflectionTestUtils.setField(bookmark, "id", 1L);
        Page<Bookmark> page = new PageImpl<>(List.of(bookmark),
            PageRequest.of(0, 20), 1);
        when(bookmarks.findAll(any(Specification.class), any(PageRequest.class)))
            .thenReturn(page);
        when(contentRepository.findAllById(List.of(CONTENT_ID)))
            .thenReturn(List.of()); // deleted - no content returned

        PageResponse<SavedItemDto> result = service.list(null, null, "newest", 0, 20);

        assertThat(result.content()).hasSize(1);
        assertThat(result.content().get(0).available()).isFalse();
        assertThat(result.content().get(0).content()).isNull();
    }

    // --- helpers -------------------------------------------------------------

    private static ContentItem publishedItem(long id) {
        ContentItem item = new ContentItem();
        ReflectionTestUtils.setField(item, "id", id);
        item.setSlug("tree-pose");
        item.setTitle("Tree Pose");
        item.setContentType(ContentType.ASANA);
        item.setStatus(ContentStatus.PUBLISHED);
        item.setPublishedAt(Instant.parse("2026-01-01T00:00:00Z"));
        return item;
    }

    private static ContentItem draftItem(long id) {
        ContentItem item = new ContentItem();
        ReflectionTestUtils.setField(item, "id", id);
        item.setSlug("secret-draft");
        item.setTitle("Secret Draft");
        item.setContentType(ContentType.ARTICLE);
        item.setStatus(ContentStatus.DRAFT);
        return item;
    }

    private static void authenticateAsUser() {
        SecurityContextHolder.getContext().setAuthentication(
            new UsernamePasswordAuthenticationToken(
                new CurrentUserPrincipal(USER_ID, "user@pranaveda.dev", Role.USER),
                null,
                List.of(() -> "ROLE_USER")));
    }

    private static org.mockito.ArgumentMatcher<PageRequest> argThatDescending(String field) {
        return pr -> {
            Sort sort = pr.getSort();
            if (sort == null) {
                return false;
            }
            for (Sort.Order o : sort) {
                if (o.getProperty().equals(field)
                    && o.getDirection().isDescending()) {
                    return true;
                }
            }
            return false;
        };
    }

    private static org.mockito.ArgumentMatcher<PageRequest> argThatAscending(String field) {
        return pr -> {
            Sort sort = pr.getSort();
            if (sort == null) {
                return false;
            }
            for (Sort.Order o : sort) {
                if (o.getProperty().equals(field)
                    && o.getDirection().isAscending()) {
                    return true;
                }
            }
            return false;
        };
    }
}