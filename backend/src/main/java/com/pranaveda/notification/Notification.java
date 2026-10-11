package com.pranaveda.notification;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

/**
 * An in-app notification belonging to a single user (agents.md 2.9, dashboard).
 *
 * <p>Ownership is by {@code userId} only; every query and every controller path
 * resolves the owner from the security context, never from client input, so one
 * user can never read or mutate another user's notifications.
 */
@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notification_user_created", columnList = "user_id, created_at DESC"),
        @Index(name = "idx_notification_user_read", columnList = "user_id, read_flag")
    })
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 32)
    private NotificationType type;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "body", length = 2000)
    private String body;

    /** Optional in-app deep link, e.g. "/dashboard/history". */
    @Column(name = "action_url", length = 512)
    private String actionUrl;

    @Column(name = "read_flag", nullable = false)
    private boolean read;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Notification() {
    }

    public Notification(Long userId, NotificationType type, String title, String body, String actionUrl) {
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.body = body;
        this.actionUrl = actionUrl;
        this.read = false;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public NotificationType getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public String getActionUrl() {
        return actionUrl;
    }

    public boolean isRead() {
        return read;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void markRead() {
        this.read = true;
    }
}
