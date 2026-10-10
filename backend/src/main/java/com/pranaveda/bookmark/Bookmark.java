package com.pranaveda.bookmark;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import com.pranaveda.content.ContentType;

/**
 * A saved item in a user's library (agents.md 2.6). Polymorphic: points at
 * either a {@code ContentItem} ({@code targetType=CONTENT}, covering asanas,
 * articles, videos) or an audio track ({@code targetType=AUDIO}). One Saved
 * Library can therefore hold both without a schema change later.
 *
 * <p>The unique {@code (user_id, target_type, target_id)} constraint makes
 * saving idempotent - a repeat save cannot create a duplicate row. Ownership
 * is enforced by always querying on {@code user_id} from the security context,
 * never a client-supplied ID.
 *
 * <p>{@code contentType} is a denormalized copy of the target's content type,
 * stored at save time purely so the Saved Library can filter by content type
 * in a single indexed query (no join) while keeping pagination exact. It is
 * NULL for {@code AUDIO} targets.
 */
@Entity
@Table(name = "bookmarks",
    uniqueConstraints = @UniqueConstraint(name = "uq_bookmarks_user_target",
        columnNames = {"user_id", "target_type", "target_id"}),
    indexes = {
        @Index(name = "ix_bookmarks_user_created", columnList = "user_id, created_at DESC"),
        @Index(name = "ix_bookmarks_user_type_ct", columnList = "user_id, target_type, content_type")})
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 16)
    private BookmarkTarget targetType;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    /** Denormalized content type for filtering; NULL for AUDIO targets. */
    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", length = 16)
    private ContentType contentType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public Bookmark() {
    }

    public Bookmark(Long userId, BookmarkTarget targetType, Long targetId, ContentType contentType) {
        this.userId = userId;
        this.targetType = targetType;
        this.targetId = targetId;
        this.contentType = contentType;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public BookmarkTarget getTargetType() {
        return targetType;
    }

    public Long getTargetId() {
        return targetId;
    }

    public ContentType getContentType() {
        return contentType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
