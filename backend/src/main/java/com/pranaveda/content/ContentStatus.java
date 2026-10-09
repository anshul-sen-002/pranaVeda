package com.pranaveda.content;

/**
 * Publication lifecycle. Anonymous readers may only ever see PUBLISHED items;
 * the visibility rule lives in the service layer (architecture section 4).
 */
public enum ContentStatus {
    DRAFT,
    PUBLISHED,
    ARCHIVED
}
