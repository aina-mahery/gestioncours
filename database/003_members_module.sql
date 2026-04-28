DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_status_enum') THEN
        CREATE TYPE member_status_enum AS ENUM ('actif', 'inactif');
    END IF;
END $$;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS solde NUMERIC(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS statut member_status_enum NOT NULL DEFAULT 'actif';

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_statut ON users(statut);
CREATE INDEX IF NOT EXISTS idx_users_nom_email ON users(nom, email);
