package com.pranaveda.challenge;

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

/**
 * A member's participation in a challenge (agents.md 2.11). A user joins a
 * challenge at most once (unique user_id + challenge_id). The daily completion
 * records live in {@link ChallengeDayCompletion}; this row is owner-scoped and
 * never exposed to other users or to admin analytics.
 */
@Entity
@Table(name = "challenge_participations",
    uniqueConstraints = @UniqueConstraint(name = "uq_participation_user_challenge",
        columnNames = {"user_id", "challenge_id"}),
    indexes = {
        @Index(name = "ix_participation_user", columnList = "user_id"),
        @Index(name = "ix_participation_challenge", columnList = "challenge_id")
    })
public class ChallengeParticipation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "challenge_id", nullable = false)
    private Long challengeId;

    @Column(name = "started_at", nullable = false, updatable = false)
    private Instant startedAt;

    @PrePersist
    void onCreate() {
        this.startedAt = Instant.now();
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

    public Long getChallengeId() {
        return challengeId;
    }

    public void setChallengeId(Long challengeId) {
        this.challengeId = challengeId;
    }

    public Instant getStartedAt() {
        return startedAt;
    }
}
