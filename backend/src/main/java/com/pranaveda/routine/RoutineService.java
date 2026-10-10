package com.pranaveda.routine;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.pranaveda.common.error.BadRequestException;
import com.pranaveda.common.error.NotFoundException;
import com.pranaveda.content.ContentItem;
import com.pranaveda.content.ContentItemFacet;
import com.pranaveda.content.ContentItemFacetRepository;
import com.pranaveda.content.ContentMapper;
import com.pranaveda.content.ContentRepository;
import com.pranaveda.content.ContentStatus;
import com.pranaveda.security.CurrentUserPrincipal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Personal routine builder (agents.md 2.10). Routines are private by default
 * and owner-only: every method resolves the routine under the caller's user id,
 * so one user can never read, edit, reorder, or delete another's routine.
 *
 * <p>Sequence contents are validated server-side - every referenced content id
 * must exist and be PUBLISHED, so a routine can never embed a draft/archived or
 * nonexistent item. Saving replaces the routine's items wholesale, which is how
 * reordering is expressed: the stored order always equals the client's order.
 */
@Service
public class RoutineService {

    private static final int MAX_ITEMS = 100;

    private final RoutineRepository routines;
    private final RoutineItemRepository items;
    private final ContentRepository contentRepository;
    private final ContentItemFacetRepository facetRepository;

    public RoutineService(RoutineRepository routines,
                          RoutineItemRepository items,
                          ContentRepository contentRepository,
                          ContentItemFacetRepository facetRepository) {
        this.routines = routines;
        this.items = items;
        this.contentRepository = contentRepository;
        this.facetRepository = facetRepository;
    }

    /**
     * Creates a routine for the caller. Validates every referenced content id is
     * a published item before persisting anything.
     */
    @Transactional
    public RoutineDto create(RoutineRequest request) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        validateItems(request.items());

        Routine routine = new Routine();
        routine.setUserId(userId);
        routine.setName(request.name().trim());
        routine.setDescription(trimToNull(request.description()));
        Routine saved = routines.save(routine);

        saveItems(saved, request.items());
        return load(saved.getId());
    }

    /** The caller's routines, most-recently-updated first, with item counts. */
    @Transactional(readOnly = true)
    public List<RoutineSummaryDto> listMine() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        return routines.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(routine -> RoutineSummaryDto.of(routine, (int) items.countByRoutineId(routine.getId())))
                .toList();
    }

    /** One of the caller's routines with its full ordered sequence. */
    @Transactional(readOnly = true)
    public RoutineDto load(long id) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        Routine routine = routines.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Routine not found."));
        return toDto(routine);
    }

    /**
     * Renames/edits a routine and replaces its sequence. Reordering is expressed
     * by reordering {@code items}; the stored order becomes the client's order.
     */
    @Transactional
    public RoutineDto update(long id, RoutineRequest request) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        Routine routine = routines.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Routine not found."));

        validateItems(request.items());

        routine.setName(request.name().trim());
        routine.setDescription(trimToNull(request.description()));
        routines.save(routine);

        items.deleteByRoutineId(routine.getId());
        saveItems(routine, request.items());
        return toDto(routine);
    }

    /** Deletes one of the caller's routines (and its items). Idempotent. */
    @Transactional
    public void delete(long id) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        if (!routines.existsByIdAndUserId(id, userId)) {
            throw new NotFoundException("Routine not found.");
        }
        items.deleteByRoutineId(id);
        routines.deleteByIdAndUserId(id, userId);
    }


    /**
     * Validates that every referenced content id exists and is published, and
     * that the sequence is non-empty and within the size cap. Returns the
     * validated items for reuse when building DTOs.
     */
    private Map<Long, ContentItem> validateItems(List<RoutineItemRequest> requested) {
        List<RoutineItemRequest> safe = requested == null ? List.of() : requested;
        if (safe.isEmpty()) {
            throw new BadRequestException("A routine must contain at least one item.");
        }
        if (safe.size() > MAX_ITEMS) {
            throw new BadRequestException("A routine may contain at most " + MAX_ITEMS + " items.");
        }
        if (safe.stream().anyMatch(item -> item.contentId() == null)) {
            throw new BadRequestException("Every routine item needs a content id.");
        }

        List<Long> ids = safe.stream().map(RoutineItemRequest::contentId).distinct().toList();
        Map<Long, ContentItem> byId = contentRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(ContentItem::getId, Function.identity()));

        for (Long id : ids) {
            ContentItem item = byId.get(id);
            if (item == null || item.getStatus() != ContentStatus.PUBLISHED) {
                throw new BadRequestException("Content " + id + " is not available to add to a routine.");
            }
        }
        return byId;
    }

    private void saveItems(Routine routine, List<RoutineItemRequest> requested) {
        List<RoutineItemRequest> safe = requested == null ? List.of() : requested;
        List<RoutineItem> toSave = new java.util.ArrayList<>(safe.size());
        for (int i = 0; i < safe.size(); i++) {
            RoutineItemRequest request = safe.get(i);
            RoutineItem item = new RoutineItem();
            item.setRoutineId(routine.getId());
            item.setContentId(request.contentId());
            item.setPosition(i);
            item.setDurationSeconds(request.durationSeconds());
            item.setNote(trimToNull(request.note()));
            toSave.add(item);
        }
        items.saveAll(toSave);
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() > 500 ? trimmed.substring(0, 500) : trimmed;
    }


    private RoutineDto toDto(Routine routine) {
        List<RoutineItem> ordered = items.findByRoutineIdOrderByPositionAsc(routine.getId());
        List<Long> contentIds = ordered.stream().map(RoutineItem::getContentId).distinct().toList();
        Map<Long, ContentItem> contentMap = contentIds.isEmpty() ? Map.of()
                : contentRepository.findAllById(contentIds).stream()
                        .collect(Collectors.toMap(ContentItem::getId, Function.identity()));
        Map<Long, List<ContentItemFacet>> facetMap = contentIds.isEmpty() ? Map.of()
                : ContentItemFacetRepository.groupByContentId(facetRepository.findByContentIdIn(contentIds));

        List<RoutineItemDto> itemDtos = new java.util.ArrayList<>(ordered.size());
        for (RoutineItem item : ordered) {
            ContentItem content = contentMap.get(item.getContentId());
            var summary = content == null ? null
                    : ContentMapper.summary(content, facetMap.getOrDefault(content.getId(), List.of()));
            itemDtos.add(new RoutineItemDto(item.getId(), item.getPosition(),
                    item.getDurationSeconds(), item.getNote(), summary));
        }
        return new RoutineDto(routine.getId(), routine.getName(), routine.getDescription(),
                routine.isPublic(), ordered.size(), itemDtos, routine.getCreatedAt(), routine.getUpdatedAt());
    }
}
