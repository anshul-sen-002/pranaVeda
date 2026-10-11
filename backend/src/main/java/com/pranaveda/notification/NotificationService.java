package com.pranaveda.notification;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pranaveda.common.error.NotFoundException;

/**
 * In-app notification business logic.
 *
 * <p>Every public method takes the owner id explicitly; controllers pass
 * {@code CurrentUserPrincipal.requireCurrentUserId()} so ownership is always
 * server-derived. Reading another user's notification is impossible by
 * construction (there is no find-by-id-without-owner path).
 */
@Service
public class NotificationService {

    /** Hard cap on a single page so a client cannot request unbounded rows. */
    private static final int MAX_PAGE_SIZE = 50;

    private final NotificationRepository notifications;

    public NotificationService(NotificationRepository notifications) {
        this.notifications = notifications;
    }

    /** Persist a notification for the given user. Used by the login flow. */
    @Transactional
    public void create(Long userId, NotificationType type, String title, String body, String actionUrl) {
        notifications.save(new Notification(userId, type, title, body, actionUrl));
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> list(Long userId) {
        return notifications.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, MAX_PAGE_SIZE))
            .stream()
            .map(NotificationDto::from)
            .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notifications.countByUserIdAndReadFalse(userId);
    }

    /** Mark one notification read; only succeeds when it belongs to the owner. */
    @Transactional
    public void markRead(Long userId, Long notificationId) {
        Notification n = notifications.findById(notificationId)
            .filter(candidate -> candidate.getUserId().equals(userId))
            .orElseThrow(() -> new NotFoundException("Notification not found."));
        n.markRead();
        notifications.save(n);
    }

    @Transactional
    public int markAllRead(Long userId) {
        return notifications.markAllReadForUser(userId);
    }
}
