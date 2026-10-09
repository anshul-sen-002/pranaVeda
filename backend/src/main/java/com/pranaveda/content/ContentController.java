package com.pranaveda.content;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;

import com.pranaveda.common.dto.PageResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public content browsing (agents.md 2.1) - no login required, PUBLISHED
 * items only. Filter values are enum-bound or whitelisted, so malformed
 * parameters produce a 400 validation envelope instead of a 500.
 */
@Tag(name = "Content")
@RestController
@RequestMapping("/api/v1/content")
public class ContentController {

    private final ContentService contentService;

    public ContentController(ContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping
    public PageResponse<ContentSummary> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) ContentType type,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) Integer durationMax,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(required = false) Goal goal,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        // normalized() at the boundary so malformed sort/filter values become a
        // 400 validation envelope before any query is built (agents.md 2.5).
        return contentService.list(new ContentQuery(
            q, type, difficulty, durationMax, category, splitTags(tags), goal, sort, page, size).normalized());
    }

    @GetMapping("/{slug}")
    public ContentDetail get(@PathVariable String slug) {
        return contentService.getPublished(slug);
    }

    /** Accepts repeated (?tags=a&tags=b) and comma-separated (?tags=a,b) forms. */
    static List<String> splitTags(List<String> raw) {
        if (raw == null) {
            return List.of();
        }
        return raw.stream()
            .filter(Objects::nonNull)
            .flatMap(value -> Arrays.stream(value.split(",")))
            .map(String::trim)
            .filter(value -> !value.isEmpty())
            .toList();
    }
}
