DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'paiement_statut_enum'
          AND e.enumlabel = 'partiel'
    ) THEN
        ALTER TYPE paiement_statut_enum ADD VALUE 'partiel';
    END IF;
END $$;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS fidele BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS telephone VARCHAR(30);

ALTER TABLE paiements
ADD COLUMN IF NOT EXISTS montant_paye NUMERIC(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE paiements
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days');

ALTER TABLE paiements
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE paiements
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE paiements
ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);

ALTER TABLE paiements
ADD COLUMN IF NOT EXISTS stripe_payment_intent VARCHAR(255);

ALTER TABLE paiements
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(100);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_paiements_user_cours'
    ) THEN
        ALTER TABLE paiements
        ADD CONSTRAINT uq_paiements_user_cours UNIQUE (user_id, cours_id);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_paiements_created_at ON paiements(created_at);
CREATE INDEX IF NOT EXISTS idx_paiements_due_date ON paiements(due_date);
CREATE INDEX IF NOT EXISTS idx_paiements_statut ON paiements(statut);
CREATE INDEX IF NOT EXISTS idx_paiements_invoice_number ON paiements(invoice_number);
