package com.pranaveda.notification;

/**
 * Categories of in-app notifications.
 *
 * <p>Stored as a string ({@code @Enumerated(EnumType.STRING)}) so new types can
 * be added later without a data migration. LOGIN_ALERT is emitted on each
 * successful sign-in; WELCOME and SYSTEM are available for future flows.
 */
public enum NotificationType {
    WELCOME,
    LOGIN_ALERT,
    SYSTEM
}
