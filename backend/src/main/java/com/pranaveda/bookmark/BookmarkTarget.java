package com.pranaveda.bookmark;

/**
 * What a bookmark points at. {@code CONTENT} covers asanas, articles, and
 * videos (all {@code ContentItem}); {@code AUDIO} is reserved for the Calm
 * Music library (agents.md 2.6 "calm audio tracks"). A polymorphic target lets
 * one Saved Library hold both without a schema change later.
 */
public enum BookmarkTarget {
    CONTENT,
    AUDIO
}
