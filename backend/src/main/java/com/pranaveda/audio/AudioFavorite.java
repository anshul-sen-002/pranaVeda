package com.pranaveda.audio;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import org.hibernate.annotations.Check;

/**
 * A signed-in member's saved audio track (agents.md 2.12 "favorite tracks").
 * Owner-only private data: every query resolves the owner from the security
 * context, so a user can never see or mutate another's favorites (IDOR rule).
 *
 * <p>The unique {@code (user_id, track_id)} constraint makes favoriting
 * idempotent - toggling the same track twice cannot create a duplicate row.
 * Favoriting a track does not copy the audio; it only records the intent, so if
 * a track is later unpublished the favorite is simply dropped from the listing.
 */
@Entity
@Table(name = "audio_favorites",
    uniqueConstraints = @UniqueConstraint(name = "uq_audio_favorites_user_track",
        columnNames = {"user_id", "track_id"}),
    indexes = {
        @Index(name = "ix_audio_favorites_user", columnList = "user_id"),
        @Index(name = "ix_audio_favorites_track", columnList = "track_id")})
@Check(constraints = "track_id > 0")
public class AudioFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "track_id", nullable = false)
    private Long trackId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
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

    public Long getTrackId() {
        return trackId;
    }

    public void setTrackId(Long trackId) {
        this.trackId = trackId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
