package com.pranaveda.challenge;

import java.time.Instant;
import java.time.LocalDate;

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
 * One completed challenge day (agents.md 2.11). The unique constraint on
 * (participation_id, practice_date) is the DB-level guarantee that retries do
 * NOT double-count a day - the completion endpoint is idempotent by design.
 *
 * <p>{@code practiceDate} is a calendar date in the user's timezone, so the
 * same UTC instant never lands on two different challenge days for one user.
 */
@Entity
@Table(name = "challenge_day_completions",
    uniqueConstraints = @UniqueConstraint(name = "uq_day_participation_date",
        columnNames = {"participation_id", "practice_date"}),
    indexes = @Index(name = "ix_day_participation", columnList = "participation_id"))
public class ChallengeDayCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "participation_id", nullable = false)
    private Long participationId;

    /** User's local calendar date of the completed practice. */
    @Column(name = "practice_date", nullable = false)
    private LocalDate practiceDate;

    /** Minutes logged for the day (>= the challenge daily goal). */
    @Column(name = "minutes_logged", nullable = false)
    private int minutesLogged;

    @Column(name = "completed_at", nullable = false, updatable = false)
    private Instant completedAt;

    @PrePersist
    void onCreate() {
        this.completedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getParticipationId() {
        return participationId;
    }

    public void setParticipationId(Long participationId) {
        this.participationId = participationId;
    }

    public LocalDate getPracticeDate() {
        return practiceDate;
    }

    public void setPracticeDate(LocalDate practiceDate) {
        this.practiceDate = practiceDate;
    }

    public int getMinutesLogged() {
        return minutesLogged;
    }

    public void setMinutesLogged(int minutesLogged) {
        this.minutesLogged = minutesLogged;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }
}
