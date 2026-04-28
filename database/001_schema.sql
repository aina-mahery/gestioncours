CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM ('admin', 'formateur', 'eleve');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'presence_statut_enum') THEN
        CREATE TYPE presence_statut_enum AS ENUM ('present', 'absent');
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'paiement_statut_enum') THEN
        CREATE TYPE paiement_statut_enum AS ENUM ('paye', 'impaye');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role_enum NOT NULL DEFAULT 'eleve',
    photo BYTEA
);

CREATE TABLE IF NOT EXISTS cours (
    id BIGSERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    capacite INTEGER NOT NULL CHECK (capacite >= 0),
    planning JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS presence (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    statut presence_statut_enum NOT NULL,
    CONSTRAINT fk_presence_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS paiements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    cours_id BIGINT NOT NULL,
    montant NUMERIC(10, 2) NOT NULL CHECK (montant >= 0),
    statut paiement_statut_enum NOT NULL,
    CONSTRAINT fk_paiements_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_paiements_cours
        FOREIGN KEY (cours_id)
        REFERENCES cours(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS posts (
    id BIGSERIAL PRIMARY KEY,
    cours_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    contenu TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
    CONSTRAINT fk_posts_cours
        FOREIGN KEY (cours_id)
        REFERENCES cours(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_posts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_credentials (
    user_id BIGINT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    CONSTRAINT fk_user_credentials_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_paiements_user_id ON paiements(user_id);
CREATE INDEX IF NOT EXISTS idx_paiements_cours_id ON paiements(cours_id);
CREATE INDEX IF NOT EXISTS idx_posts_cours_id ON posts(cours_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_presence_user_id ON presence(user_id);
