package com.pranaveda.content;

import java.util.List;
import java.util.Locale;

import com.pranaveda.common.error.BadRequestException;

import org.springframework.data.domain.Sort;

/**
 * Validated, normalized filter state for content lists (public and admin).
 * Raw request parameters arrive through the constructor; {@link #normalized()}
 * trims, clamps, defaults, and whitelists them (architecture section 8).
 */
public record ContentQuery(
    String q,
    ContentType contentType,
    Difficulty difficulty,
    Integer durationMax,
    String category,
    List<String> tags,
    Goal goal,
    String sort,
    int page,
    int size) {

    public static final int MAX_SIZE = 50;
    private static final List<String> SORT_KEYS =
        List.of("newest", "oldest", "title_asc", "duration_asc");

    /** @throws BadRequestException for an unknown sort key */
    public ContentQuery normalized() {
        String safeSort = sort == null || sort.isBlank() ? "newest" : sort.trim();
        if (!SORT_KEYS.contains(safeSort)) {
            throw new BadRequestException(
                "Unknown sort '" + safeSort + "'. Allowed: " + String.join(", ", SORT_KEYS));
        }
        String safeQ = q == null || q.isBlank() ? null : q.trim();
        String safeCategory = category == null || category.isBlank()
            ? null : category.trim().toLowerCase(Locale.ROOT);
        List<String> safeTags = tags == null ? List.of() : tags.stream()
            .filter(tag -> tag != null && !tag.isBlank())
            .map(tag -> tag.trim().toLowerCase(Locale.ROOT))
            .distinct()
            .toList();
        return new ContentQuery(safeQ, contentType, difficulty, durationMax, safeCategory, safeTags,
            goal, safeSort, Math.max(0, page), Math.min(Math.max(1, size), MAX_SIZE));
    }

    /**
     * Deterministic ordering - every sort key gets an {@code id} tie-breaker
     * (architecture section 8). {@code dateProperty} is {@code publishedAt}
     * for the public list and {@code createdAt} for the admin list.
     */
    public Sort toSort(String dateProperty) {
        String key = sort == null || sort.isBlank() ? "newest" : sort.trim();
        return switch (key) {
            case "oldest" -> Sort.by(Sort.Order.asc(dateProperty), Sort.Order.asc("id"));
            case "title_asc" -> Sort.by(Sort.Order.asc("title"), Sort.Order.asc("id"));
            case "duration_asc" -> Sort.by(Sort.Order.asc("durationMinutes"), Sort.Order.asc("id"));
            default -> Sort.by(Sort.Order.desc(dateProperty), Sort.Order.desc("id"));
        };
    }
}
