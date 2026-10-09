-- V3: yoga content library (Phase 3) - content items, taxonomy, goal/body-area facets.
-- Design: docs/architecture.md sections 7-8; publication visibility is
-- enforced in the service layer (PUBLISHED only for anonymous readers).

CREATE TABLE content_items (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug               VARCHAR(160) NOT NULL,
    title              VARCHAR(200) NOT NULL,
    summary            VARCHAR(500),
    description        TEXT,
    common_name        VARCHAR(120),
    sanskrit_name      VARCHAR(160),
    content_type       VARCHAR(16) NOT NULL,
    status             VARCHAR(16) NOT NULL DEFAULT 'DRAFT',
    difficulty         VARCHAR(16),
    duration_minutes   INTEGER,
    featured_image_url VARCHAR(500),
    instructions       TEXT,
    breathing_notes    TEXT,
    modifications      TEXT,
    safety_precautions TEXT,
    benefits           TEXT,
    evidence_notes     TEXT,
    seo_title          VARCHAR(200),
    seo_description    VARCHAR(300),
    created_by         BIGINT REFERENCES users (id) ON DELETE SET NULL,
    updated_by         BIGINT REFERENCES users (id) ON DELETE SET NULL,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    published_at       TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_content_items_slug UNIQUE (slug),
    CONSTRAINT ck_content_status CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    CONSTRAINT ck_content_type CHECK (content_type IN ('ASANA', 'ARTICLE', 'VIDEO')),
    CONSTRAINT ck_content_difficulty
        CHECK (difficulty IS NULL OR difficulty IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    CONSTRAINT ck_content_duration CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

CREATE INDEX ix_content_items_status ON content_items (status);
CREATE INDEX ix_content_items_type ON content_items (content_type);
CREATE INDEX ix_content_items_difficulty ON content_items (difficulty);
CREATE INDEX ix_content_items_published_desc ON content_items (published_at DESC);
-- Trigram indexes power the ILIKE-style search from V1's pg_trgm extension.
CREATE INDEX ix_content_items_title_trgm ON content_items USING gin (title gin_trgm_ops);
CREATE INDEX ix_content_items_summary_trgm ON content_items USING gin (summary gin_trgm_ops);

CREATE TABLE categories (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug        VARCHAR(120) NOT NULL,
    name        VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uq_categories_slug UNIQUE (slug)
);

CREATE TABLE tags (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug       VARCHAR(100) NOT NULL,
    name       VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT uq_tags_slug UNIQUE (slug)
);

CREATE TABLE content_categories (
    content_id  BIGINT NOT NULL REFERENCES content_items (id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories (id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, category_id)
);
CREATE INDEX ix_content_categories_category ON content_categories (category_id);

CREATE TABLE content_tags (
    content_id BIGINT NOT NULL REFERENCES content_items (id) ON DELETE CASCADE,
    tag_id     BIGINT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
);
CREATE INDEX ix_content_tags_tag ON content_tags (tag_id);

-- Goals and target body areas as filterable facets (agents.md 2.5):
-- facet_type = 'GOAL' | 'TARGET_AREA', facet_value validated against the
-- application whitelist (Goal enum / normalized body-area values).
CREATE TABLE content_item_facets (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    content_id  BIGINT NOT NULL REFERENCES content_items (id) ON DELETE CASCADE,
    facet_type  VARCHAR(20) NOT NULL,
    facet_value VARCHAR(40) NOT NULL,
    CONSTRAINT uq_content_facet UNIQUE (content_id, facet_type, facet_value),
    CONSTRAINT ck_content_facet_type CHECK (facet_type IN ('GOAL', 'TARGET_AREA'))
);
CREATE INDEX ix_content_facets_lookup ON content_item_facets (facet_type, facet_value);
CREATE INDEX ix_content_facets_content ON content_item_facets (content_id);
