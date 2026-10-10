package com.pranaveda.bookmark;

import java.time.Instant;

import com.pranaveda.content.ContentSummary;
import com.pranaveda.content.ContentType;

/**
 * One entry in the Saved Library (agents.md 2.6).
 *
 * <p>{@code available=false} means the saved target was deleted or unpublished
 * since it was saved. Such entries are still returned (not silently dropped) so
 * the user can see and remove stale saves - graceful handling of removed
 * content. {@code content} is then null; it is only populated for CONTENT
 * targets that are still published.
 */
public record SavedItemDto(
        BookmarkTarget targetType,
        long targetId,
        ContentType contentType,
        Instant savedAt,
        boolean available,
        ContentSummary content) {
}
