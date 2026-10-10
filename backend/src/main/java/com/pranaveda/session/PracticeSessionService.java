package com.pranaveda.session;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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
import com.pranaveda.security.CurrentUserPrincipal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Practice-session recording, history, and stats (agents.md 2.9, 2.10).
 *
 * <p>A row here IS a completed practice: it is created only by the explicit
 * "finish session" action, never by opening a timer, so the backend remains the
 * single source of truth for streaks and totals (agents.md 2.10, 2.11). Every
 * operation resolves the owner from the security context - a user can never
 * read, edit, or delete another user's sessions (IDOR rule).
 *
 * <p>Optional {@code contentId} links a session to what was practised. If that
 * content is later deleted, the session keeps its recorded minutes - only the
 * content preview is dropped, so history and totals never silently lose a
 * completed practice.
 */
@Service
public class PracticeSessionService {

    private static final int MAX_PAGE_SIZE = 50;

    private final PracticeSessionRepository sessions;
    private final ContentRepository contentRepository;
    private final ContentItemFacetRepository facetRepository;

    public PracticeSessionService(PracticeSessionRepository sessions,
                                  ContentRepository contentRepository,
                                  ContentItemFacetRepository facetRepository) {
        this.sessions = sessions;
        this.contentRepository = contentRepository;
        this.facetRepository = facetRepository;
    }

    /**
     * Records a completed practice. Validates the optional content reference
     * exists, rejects future timestamps, and persists the session under the
     * caller. Returns the created session with its content preview.
     */
    @Transactional
    public PracticeSessionDto record(PracticeSessionRequest request) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();

        if (request.contentId() != null && !contentRepository.existsById(request.contentId())) {
            throw new NotFoundException("Content not found.");
        }

        Instant completedAt = request.completedAt() == null ? Instant.now() : request.completedAt();
        // Refuse clearly future timestamps so history and streaks cannot be
        // poisoned by a client with a fast clock.
        if (completedAt.isAfter(Instant.now())) {
            throw new BadRequestException("Completed-at time cannot be in the future.");
        }

        PracticeSession session = new PracticeSession();
        session.setUserId(userId);
        session.setContentId(request.contentId());
        session.setDurationMinutes(request.durationMinutes());
        session.setCompletedAt(completedAt);
        session.setNotes(trimToNull(request.notes()));

        PracticeSession saved = sessions.save(session);
        return toDto(saved, contentMap(List.of(saved)), facetMap(List.of(saved)));
    }

    /** The caller's full practice history, newest first, paginated. */
    @Transactional(readOnly = true)
    public PageResponse<PracticeSessionDto> list(int page, int size) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        Page<PracticeSession> result = sessions.findByUserIdOrderByCompletedAtDesc(
                userId, pageRequest(page, size));
        return PageResponse.of(mapPage(result.getContent()), result.getNumber(),
                result.getSize(), result.getTotalElements());
    }

    /** One of the caller's sessions by id. 404 if missing or not theirs. */
    @Transactional(readOnly = true)
    public PracticeSessionDto get(long id) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        PracticeSession session = sessions.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Practice session not found."));
        return toDto(session, contentMap(List.of(session)), facetMap(List.of(session)));
    }

    /** Deletes one of the caller's sessions. Idempotent - absent is a no-op. */
    @Transactional
    public void delete(long id) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        sessions.deleteByIdAndUserId(id, userId);
    }

    /** Aggregate practice totals for the dashboard (agents.md 2.9). */
    @Transactional(readOnly = true)
    public PracticeStatsDto stats() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        Instant now = Instant.now();
        Instant from7 = now.minus(Duration.ofDays(7));
        Instant from30 = now.minus(Duration.ofDays(30));

        Long total = sessions.sumMinutesByUserId(userId);
        Long last7 = sessions.sumMinutesBetween(userId, from7, now);
        Long last30 = sessions.sumMinutesBetween(userId, from30, now);

        return new PracticeStatsDto(
                sessions.countByUserId(userId),
                total == null ? 0L : total,
                sessions.countBetween(userId, from7, now),
                last7 == null ? 0L : last7,
                sessions.countBetween(userId, from30, now),
                last30 == null ? 0L : last30);
    }

    // --- helpers -----------------------------------------------------------

    private List<PracticeSessionDto> mapPage(List<PracticeSession> content) {
        Map<Long, ContentItem> items = contentMap(content);
        Map<Long, List<ContentItemFacet>> facets = facetMap(content);
        return content.stream().map(session -> toDto(session, items, facets)).toList();
    }

    private Map<Long, ContentItem> contentMap(List<PracticeSession> content) {
        List<Long> ids = contentIds(content);
        if (ids.isEmpty()) {
            return Map.of();
        }
        return contentRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(ContentItem::getId, Function.identity()));
    }

    private Map<Long, List<ContentItemFacet>> facetMap(List<PracticeSession> content) {
        List<Long> ids = contentIds(content);
        if (ids.isEmpty()) {
            return Map.of();
        }
        return ContentItemFacetRepository.groupByContentId(facetRepository.findByContentIdIn(ids));
    }

    private static List<Long> contentIds(List<PracticeSession> content) {
        return content.stream()
                .map(PracticeSession::getContentId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private static PracticeSessionDto toDto(PracticeSession session,
                                            Map<Long, ContentItem> contentMap,
                                            Map<Long, List<ContentItemFacet>> facetMap) {
        ContentItem item = session.getContentId() == null
                ? null : contentMap.get(session.getContentId());
        var summary = item == null
                ? null : ContentMapper.summary(item, facetMap.getOrDefault(item.getId(), List.of()));
        return new PracticeSessionDto(
                session.getId(),
                session.getContentId(),
                summary,
                session.getDurationMinutes(),
                session.getCompletedAt(),
                session.getNotes(),
                session.getCreatedAt());
    }

    private static PageRequest pageRequest(int page, int size) {
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        Sort sort = Sort.by(Sort.Order.desc("completedAt"), Sort.Order.desc("id"));
        return PageRequest.of(Math.max(0, page), safeSize, sort);
    }

    private static String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.length() > 500 ? trimmed.substring(0, 500) : trimmed;
    }
}
