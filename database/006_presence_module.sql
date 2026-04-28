DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'presence_statut_enum'
          AND e.enumlabel = 'retard'
    ) THEN
        ALTER TYPE presence_statut_enum ADD VALUE 'retard';
    END IF;
END $$;

ALTER TABLE presence
ALTER COLUMN session_id TYPE VARCHAR(100) USING session_id::text;

ALTER TABLE presence
ADD COLUMN IF NOT EXISTS scan_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS qr_token VARCHAR(255),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_presence_session ON presence(session_id);
CREATE INDEX IF NOT EXISTS idx_presence_user ON presence(user_id);
CREATE INDEX IF NOT EXISTS idx_presence_created_at ON presence(created_at);
