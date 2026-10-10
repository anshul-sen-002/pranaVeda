package com.pranaveda.bookmark;

import com.pranaveda.common.dto.PageResponse;
import com.pranaveda.content.ContentType;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

/**
 * Saved Library endpoints (agents.md 2.6). All routes live under
 * {@code /api/v1/me/**}, which the security chain restricts to authenticated
 * users, and every operation re-resolves the owner from the security context.
 */
@Tag(name = "Saved library")
@RestController
@RequestMapping("/api/v1/me/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    /** Saves an item. Idempotent. */
    @PostMapping
    public ResponseEntity<SavedItemDto> save(@Valid @RequestBody BookmarkRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookmarkService.save(request));
    }

    /** Removes a saved item. Idempotent. */
    @DeleteMapping("/{targetType}/{targetId}")
    public ResponseEntity<Void> remove(@PathVariable BookmarkTarget targetType,
            @PathVariable long targetId) {
        bookmarkService.remove(targetType, targetId);
        return ResponseEntity.noContent().build();
    }

    /** Whether the signed-in user has this item saved (UI state). */
    @GetMapping("/status")
    public BookmarkStatusDto status(@RequestParam BookmarkTarget targetType,
            @RequestParam long targetId) {
        return new BookmarkStatusDto(bookmarkService.exists(targetType, targetId));
    }

    /** The Saved Library page, with optional filters and sorting. */
    @GetMapping
    public PageResponse<SavedItemDto> list(
            @RequestParam(required = false) BookmarkTarget targetType,
            @RequestParam(required = false) ContentType contentType,
            @RequestParam(required = false, defaultValue = "newest") String sort,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int size) {
        return bookmarkService.list(targetType, contentType, sort, page, size);
    }
}
