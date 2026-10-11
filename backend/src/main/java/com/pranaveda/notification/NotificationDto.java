package com.pranaveda.notification;

import java.time.Instant;

/** Safe owner-facing view of a notification (never exposes internals). */
public record NotificationDto(
        Long id,
        NotificationType type,
        String title,
        String body,
        String actionUrl,
        boolean read,
        Instant createdAt) {

    public static NotificationDto from(Notification n) {
        return new NotificationDto(
            n.getId(), n.getType(), n.getTitle(), n.getBody(),
            n.getActionUrl(), n.isRead(), n.getCreatedAt());
    }
}
