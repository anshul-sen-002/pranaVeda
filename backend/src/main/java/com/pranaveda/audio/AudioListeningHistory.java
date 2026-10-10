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

import org.hibernate.annotations.Check;

/**
 * A record that a signed-in member played a track (agents.md 2.12 "listening
 * history after login"). Append-only and owner-only; used to power a "recently
 * played" section and, later, taste-aware recommendations. No frames or
 * personally sensitive data are stored - only the fact and time of the play.
 *
 * <p>History intentionally keeps rows for unpublished tracks (the play happened)
 * but the service resolves track metadata best-effort, so a since-deleted track
 * simply shows as a placeholder rather than corrupting the history list.
 */
@Entity
@Table(name = "audio_listening_history",
    indexes = {
        @Index(name = "ix_audio_history_user_time", columnList = "user_id, played_at DESC"),
        @Index(name = "ix_audio_history_track", columnList = "track_id")})
@Check(constraints = "track_id > 0 AND seconds_listened >= 0")
public class AudioListeningHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "track_id", nullable = false)
    private Long trackId;

    /** How many seconds the member listened, if reported; null when not tracked. */
    @Column(name = "seconds_listened")
    private Integer secondsListened;

    @Column(name = "played_at", nullable = false)
    private Instant playedAt;

    @PrePersist
    void onCreate() {
        if (this.playedAt == null) {
            this.playedAt = Instant.now();
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

    public Long getTrackId() {
        return trackId;
    }

    public void setTrackId(Long trackId) {
        this.trackId = trackId;
    }

    public Integer getSecondsListened() {
        return secondsListened;
    }

    public void setSecondsListened(Integer secondsListened) {
        this.secondsListened = secondsListened;
    }

    public Instant getPlayedAt() {
        return playedAt;
    }

    public void setPlayedAt(Instant playedAt) {
        this.playedAt = playedAt;
    }
}
