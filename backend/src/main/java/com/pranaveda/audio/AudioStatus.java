package com.pranaveda.audio;

/**
 * Publication lifecycle for calm-music tracks. Anonymous visitors may only ever
 * stream PUBLISHED tracks; drafts and archived tracks do not exist as far as the
 * public API is concerned (mirrors ContentStatus, agents.md 2.12).
 */
public enum AudioStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
}
