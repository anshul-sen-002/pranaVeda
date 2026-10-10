package com.pranaveda.challenge;

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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * A challenge definition, e.g. the 7-day yoga challenge (agents.md 2.11).
 *
 * <p>Only {@code PUBLISHED} challenges are joinable by members. The definition
 * documents what counts as a completed practice day via {@code dailyGoalMinutes}
 * - a day counts only when a member logs at least this many practice minutes.
 */
@Entity
@Table(name = "challenges",
    uniqueConstraints = @UniqueConstraint(name = "uq_challenges_slug", columnNames = "slug"),
    indexes = @Index(name = "ix_challenges_status", columnList = "status"))
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slug", nullable = false, length = 120)
    private String slug;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "summary", length = 400)
    private String summary;

    @Column(name = "description", length = 2000)
    private String description;

    /** Number of days in the challenge (7 for the standard challenge). */
    @Column(name = "duration_days", nullable = false)
    private int durationDays;

    /**
     * Documented definition of a completed practice day: the minimum minutes a
     * member must log for a day to count toward the challenge (agents.md 2.11).
     */
    @Column(name = "daily_goal_minutes", nullable = false)
    private int dailyGoalMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 12)
    private ChallengeStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }

    public int getDailyGoalMinutes() {
        return dailyGoalMinutes;
    }

    public void setDailyGoalMinutes(int dailyGoalMinutes) {
        this.dailyGoalMinutes = dailyGoalMinutes;
    }

    public ChallengeStatus getStatus() {
        return status;
    }

    public void setStatus(ChallengeStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
