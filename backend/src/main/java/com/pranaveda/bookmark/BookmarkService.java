package com.pranaveda.bookmark;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.pranaveda.common.dto.PageResponse;
import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.content.ContentItem;
import com.pranaveda.content.ContentItemFacet;
import com.pranaveda.content.ContentItemFacetRepository;
import com.pranaveda.content.ContentMapper;
import com.pranaveda.content.ContentRepository;
import com.pranaveda.content.ContentStatus;
import com.pranaveda.content.ContentType;
import com.pranaveda.security.CurrentUserPrincipal;

import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Saved Library (agents.md 2.6). Save/unsave/list are all scoped to the
 * signed-in
 * user, resolved from the security context - a client can never read or modify
 * another user's saved items by guessing IDs.
 *
 * <p>
 * Content targets are validated on save (must exist and be PUBLISHED), and the
 * list gracefully surfaces items deleted or unpublished after being saved: they
 * appear with {@code available=false} so the user can still see and remove
 * them,
 * rather than being silently dropped.
 *
 * <p>
 * AUDIO targets are recognised by the model now but rejected until the Calm
 * Music library exists, so no schema change is needed later.
 */
@Service
public class BookmarkService {

    private final BookmarkRepository bookmarks;
    private final ContentRepository contentRepository;
    private final ContentItemFacetRepository facetRepository;

    public BookmarkService(BookmarkRepository bookmarks,
            ContentRepository contentRepository,
            ContentItemFacetRepository facetRepository) {
        this.bookmarks = bookmarks;
        this.contentRepository = contentRepository;
        this.facetRepository = facetRepository;
    }

    /** Saves an item. Idempotent - re-saving an existing bookmark returns it. */
    @Transactional
    public SavedItemDto save(BookmarkRequest request) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        ContentType contentType = resolveContentTypeForSave(request.targetType(), request.targetId());

        Bookmark bookmark = bookmarks
                .findByUserIdAndTargetTypeAndTargetId(userId, request.targetType(), request.targetId())
                .orElseGet(() -> bookmarks.save(
                        new Bookmark(userId, request.targetType(), request.targetId(), contentType)));

        return toDto(bookmark, Map.of(), Map.of());
    }

    /** Removes a saved item. Idempotent - removing an absent item is a no-op. */
    @Transactional
    public void remove(BookmarkTarget targetType, long targetId) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        bookmarks.deleteByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);
    }

    /** Whether the signed-in user has this item saved (for UI state). */
    @Transactional(readOnly = true)
    public boolean exists(BookmarkTarget targetType, long targetId) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        return bookmarks.existsByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);
    }

    /** Count of the signed-in user's saved items (dashboard headline). */
    @Transactional(readOnly = true)
    public long countMine() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        return bookmarks.countByUserId(userId);
    }

    /**
     * The Saved Library page. All filters are plain bookmark columns (no joins),
     * so pagination stays exact. Content summaries resolve in one extra query for
     * the whole page, not per row.
     */
    @Transactional(readOnly = true)
    public PageResponse<SavedItemDto> list(BookmarkTarget targetType, ContentType contentType,
            String sort, int page, int size) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        Specification<Bookmark> spec = buildSpec(userId, targetType, contentType);
        Page<Bookmark> result = bookmarks.findAll(spec, pageRequest(sort, page, size));

        List<Long> contentIds = result.getContent().stream()
                .filter(b -> b.getTargetType() == BookmarkTarget.CONTENT)
                .map(Bookmark::getTargetId)
                .toList();

        Map<Long, ContentItem> contentMap = contentIds.isEmpty() ? Map.of()
                : contentRepository.findAllById(contentIds).stream()
                        .collect(Collectors.toMap(ContentItem::getId, Function.identity()));
        Map<Long, List<ContentItemFacet>> facetMap = contentIds.isEmpty() ? Map.of()
                : ContentItemFacetRepository.groupByContentId(facetRepository.findByContentIdIn(contentIds));

        List<SavedItemDto> content = result.getContent().stream()
                .map(b -> toDto(b, contentMap, facetMap))
                .toList();
        return PageResponse.of(content, result.getNumber(), result.getSize(), result.getTotalElements());
    }

    // --- helpers -----------------------------------------------------------

    /**
     * Validates a save target and returns the content type to denormalize.
     * CONTENT must exist and be PUBLISHED; AUDIO is not available yet.
     */
    private ContentType resolveContentTypeForSave(BookmarkTarget targetType, long targetId) {
        return switch (targetType) {
            case CONTENT -> {
                ContentItem item = contentRepository.findById(targetId)
                        .orElseThrow(() -> new NotFoundException("Content not found."));
                if (item.getStatus() != ContentStatus.PUBLISHED) {
                    // Never leak the existence of drafts/archived items.
                    throw new NotFoundException("Content not found.");
                }
                yield item.getContentType();
            }
            case AUDIO -> throw new BadRequestException(
                    "The calm-music library is not available yet, so audio cannot be saved.");
        };
    }

    private static Specification<Bookmark> buildSpec(long userId, BookmarkTarget targetType,
            ContentType contentType) {
        return (root, cq, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("userId"), userId));
            if (targetType != null) {
                predicates.add(cb.equal(root.get("targetType"), targetType));
            }
            if (contentType != null) {
                // Only CONTENT targets carry a content type; this naturally
                // excludes AUDIO bookmarks (NULL) when a content filter is set.
                predicates.add(cb.equal(root.get("contentType"), contentType));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static PageRequest pageRequest(String sort, int page, int size) {
        String key = sort == null || sort.isBlank() ? "newest" : sort.trim();
        Sort ordering = switch (key) {
            case "oldest" -> Sort.by(Sort.Order.asc("createdAt"), Sort.Order.asc("id"));
            default -> Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"));
        };
        int safeSize = Math.min(Math.max(1, size), 50);
        return PageRequest.of(Math.max(0, page), safeSize, ordering);
    }

    /**
     * Maps a bookmark to its DTO. CONTENT targets resolve to a full summary when
     * still published; deleted/unpublished targets are flagged unavailable so the
     * user can see and remove them (agents.md 2.6 graceful handling).
     */
    private static SavedItemDto toDto(Bookmark bookmark,
            Map<Long, ContentItem> contentMap,
            Map<Long, List<ContentItemFacet>> facetMap) {
        if (bookmark.getTargetType() != BookmarkTarget.CONTENT) {
            // No audio library yet, so any AUDIO row cannot be resolved.
            return new SavedItemDto(bookmark.getTargetType(), bookmark.getTargetId(),
                    null, bookmark.getCreatedAt(), false, null);
        }
        ContentItem item = contentMap.get(bookmark.getTargetId());
        boolean available = item != null && item.getStatus() == ContentStatus.PUBLISHED;
        var summary = available
                ? ContentMapper.summary(item, facetMap.getOrDefault(item.getId(), List.of()))
                : null;
        return new SavedItemDto(bookmark.getTargetType(), bookmark.getTargetId(),
                bookmark.getContentType(), bookmark.getCreatedAt(), available, summary);
    }
}
