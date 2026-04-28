ALTER TABLE cours
ADD COLUMN IF NOT EXISTS duree INTEGER NOT NULL DEFAULT 1;

ALTER TABLE cours
ADD COLUMN IF NOT EXISTS jours JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE cours
ADD COLUMN IF NOT EXISTS sessions INTEGER NOT NULL DEFAULT 1;

ALTER TABLE cours
ADD COLUMN IF NOT EXISTS horaire VARCHAR(30) NOT NULL DEFAULT '08:00-09:00';

ALTER TABLE cours
ADD COLUMN IF NOT EXISTS formateur_id BIGINT NULL;

ALTER TABLE cours
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_cours_formateur'
    ) THEN
        ALTER TABLE cours
        ADD CONSTRAINT fk_cours_formateur
        FOREIGN KEY (formateur_id)
        REFERENCES users(id)
        ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cours_formateur_id ON cours(formateur_id);
CREATE INDEX IF NOT EXISTS idx_cours_created_at ON cours(created_at);
CREATE INDEX IF NOT EXISTS idx_cours_planning ON cours USING GIN (planning);
