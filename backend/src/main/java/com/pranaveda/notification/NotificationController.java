package com.pranaveda.notification;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pranaveda.security.CurrentUserPrincipal;

/**
 * In-app notification API (authenticated; ownership always from the token).
 *
 * <ul>
 *   <li>{@code GET  /me/notifications}          - newest first</li>
 *   <li>{@code GET  /me/notifications/unread-count} - badge number</li>
 *   <li>{@code POST /me/notifications/{id}/read} - mark one read (owner only)</li>
 *   <li>{@code POST /me/notifications/read-all}  - mark every unread read</li>
 * </ul>
 *
 * The {@code /read-all} mapping is declared before the {@code /{id}/read}
 * pattern at the path level it is unambiguous (literal segment), so there is no
 * routing clash.
 */
@RestController
@RequestMapping("/api/v1/me/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDto> list() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        return notificationService.list(userId);
    }

    @GetMapping("/unread-count")
    public UnreadCountDto unreadCount() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        return new UnreadCountDto(notificationService.unreadCount(userId));
    }

    @PostMapping("/{id}/read")
    public void markRead(@PathVariable Long id) {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        notificationService.markRead(userId, id);
    }

    @PostMapping("/read-all")
    public UnreadCountDto markAllRead() {
        long userId = CurrentUserPrincipal.requireCurrentUserId();
        notificationService.markAllRead(userId);
        return new UnreadCountDto(notificationService.unreadCount(userId));
    }
}
