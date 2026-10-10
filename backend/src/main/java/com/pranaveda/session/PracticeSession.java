package com.pranaveda.session;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * A recorded practice session (agents.md 2.9, 2.11). A row here IS a completed
 * practice: the backend is the source of truth for streaks and totals, and a
 * completed practice is defined as a recorded session of at least one minute.
 *
 * <p>{@code contentId} optionally links the session to the content that was
 * practised (asana/sequence); it is nullable because a session may be a general
 * practice not tied to one item. Owner is always resolved from the security
 * context - a user can never read or write another's sessions.
 */
@Entity
@Table(name = "practice_sessions",
    indexes = {
        @Index(name = "ix_practice_sessions_user_completed", columnList = "user_id, completed_at DESC"),
        @Index(name = "ix_practice_sessions_user_content", columnList = "user_id, content_id")})
public class PracticeSession {

    /** Minimum minutes for a session to count as a completed practice. */
    public static final int MIN_MINUTES = 1;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "content_id")
    private Long contentId;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    /** When the practice actually happened; defaults to now. Used for streaks. */
    @Column(name = "completed_at", nullable = false)
    private Instant completedAt;

    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (completedAt == null) {
            completedAt = Instant.now();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getContentId() {
        return contentId;
    }

    public void setContentId(Long contentId) {
        this.contentId = contentId;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
