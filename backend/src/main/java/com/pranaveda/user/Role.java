package com.pranaveda.user;

/**
 * The two application roles (agents.md section 1).
 * ADMIN is only ever granted through the controlled bootstrap, never from a
 * request payload.
 */
public enum Role {
    USER,
    ADMIN
}
