package com.pranaveda.media;

/**
 * Distinguishes media so per-type access rules can be enforced (agents.md 2.7):
 * profile photos are owner-private, content images are public, and video/audio
 * carry their own streaming vs. download permissions. Values are persisted as
 * strings and constrained in V4__media_assets.sql.
 */
public enum MediaKind {
    PROFILE_IMAGE,
    CONTENT_IMAGE,
    VIDEO,
    AUDIO
}
