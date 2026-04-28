CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE posts
ALTER COLUMN cours_id DROP NOT NULL;

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS titre VARCHAR(255),
ADD COLUMN IF NOT EXISTS parent_id BIGINT NULL,
ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS spam_reports INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_posts_parent'
    ) THEN
        ALTER TABLE posts
        ADD CONSTRAINT fk_posts_parent
        FOREIGN KEY (parent_id)
        REFERENCES posts(id)
        ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(titre, '') || ' ' || coalesce(contenu, ''))
) STORED;

CREATE TABLE IF NOT EXISTS forum_attachments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_forum_attachments_post
        FOREIGN KEY (post_id)
        REFERENCES posts(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_cours_parent_created ON posts(cours_id, parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_parent_id ON posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_spam ON posts(is_spam);
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_forum_attachments_post_id ON forum_attachments(post_id);
CREATE INDEX IF NOT EXISTS idx_presence_statut_created ON presence(statut, created_at);
CREATE INDEX IF NOT EXISTS idx_paiements_month_created ON paiements(created_at);
CREATE INDEX IF NOT EXISTS idx_paiements_statut_created ON paiements(statut, created_at);
