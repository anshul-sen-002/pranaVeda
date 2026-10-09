-- V2: identity tables for Phase 2 (authentication and authorization).
-- Design: docs/architecture.md sections 6-7.

CREATE TABLE users (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email             VARCHAR(320) NOT NULL,          -- stored normalized (lowercase, trimmed)
    password_hash     VARCHAR(100) NOT NULL,          -- BCrypt, never plaintext
    display_name      VARCHAR(80)  NOT NULL,
    role              VARCHAR(16)  NOT NULL DEFAULT 'USER',
    enabled           BOOLEAN      NOT NULL DEFAULT TRUE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT ck_users_role CHECK (role IN ('USER', 'ADMIN'))
);

CREATE TABLE refresh_tokens (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash     VARCHAR(64) NOT NULL,              -- SHA-256 hex of the opaque cookie token
    family_id      UUID NOT NULL,                     -- rotation family for reuse detection
    expires_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at     TIMESTAMP WITH TIME ZONE,           -- NULL = active
    replaced_by_id BIGINT REFERENCES refresh_tokens (id),
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash)
);

CREATE INDEX ix_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX ix_refresh_tokens_family_id ON refresh_tokens (family_id);
