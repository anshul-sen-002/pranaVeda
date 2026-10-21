package com.pranaveda.content;

import com.pranaveda.common.dto.PageResponse;

import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/**
 * Admin content studio (agents.md 2.15). Protected by
 * {@code /api/v1/admin/** -> hasRole("ADMIN")} in SecurityConfig; editor
 * identity comes from the security context inside the service.
 */
@Tag(name = "Admin content")
@RestController
@RequestMapping("/api/v1/admin/content")
public class AdminContentController {

    private final AdminContentService service;

    public AdminContentController(AdminContentService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<ContentSummary> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) ContentType type,
            @RequestParam(required = false) Difficulty difficulty,
            @RequestParam(required = false) Integer durationMax,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) java.util.List<String> tags,
            @RequestParam(required = false) Goal goal,
            @RequestParam(required = false) ContentStatus status,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ContentQuery query = new ContentQuery(
            q, type, difficulty, durationMax, category,
            ContentController.splitTags(tags), goal, sort, page, size);
        return service.list(query, status);
    }

    @PostMapping
    public org.springframework.http.ResponseEntity<ContentDetail> create(
            @Valid @RequestBody AdminContentRequest request) {
        return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
            .body(service.create(request));
    }

    @GetMapping("/{id}")
    public ContentDetail get(@PathVariable long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public ContentDetail update(@PathVariable long id, @Valid @RequestBody AdminContentRequest request) {
        return service.update(id, request);
    }

    @PostMapping("/{id}/publish")
    public ContentDetail publish(@PathVariable long id) {
        return service.publish(id);
    }

    @PostMapping("/{id}/unpublish")
    public ContentDetail unpublish(@PathVariable long id) {
        return service.unpublish(id);
    }

    @PostMapping("/{id}/archive")
    public ContentDetail archive(@PathVariable long id) {
        return service.archive(id);
    }

    /** ADMIN: deletes the content item, its Cloudinary media, and member bookmarks. */
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
