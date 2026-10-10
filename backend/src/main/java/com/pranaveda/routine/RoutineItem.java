package com.pranaveda.routine;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * One ordered step in a {@link Routine} (agents.md 2.10). References a piece of
 * published content by id (no hard FK so a deleted/archived content item can be
 * dropped from the routine without orphaning it). {@code position} is the
 * 0-based order within the routine and is unique per routine, enabling stable
 * reordering.
 */
@Entity
@Table(name = "routine_items",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_routine_items_position", columnNames = {"routine_id", "position"}),
    indexes = {
        @Index(name = "ix_routine_items_routine", columnList = "routine_id"),
        @Index(name = "ix_routine_items_content", columnList = "content_id")
    })
public class RoutineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "routine_id", nullable = false)
    private Long routineId;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    /** 0-based order within the routine; unique per routine. */
    @Column(name = "position", nullable = false)
    private int position;

    /** Optional per-step duration in seconds; null means "use the content default". */
    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "note", length = 300)
    private String note;

    public Long getId() {
        return id;
    }

    public Long getRoutineId() {
        return routineId;
    }

    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }

    public Long getContentId() {
        return contentId;
    }

    public void setContentId(Long contentId) {
        this.contentId = contentId;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
