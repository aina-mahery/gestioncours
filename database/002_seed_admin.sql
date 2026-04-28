WITH inserted_user AS (
    INSERT INTO users (nom, email, role, photo)
    VALUES ('Admin1', 'admin@ecole.fr', 'admin', NULL)
    ON CONFLICT (email) DO NOTHING
    RETURNING id
)
INSERT INTO user_credentials (user_id, password_hash)
SELECT
    id,
    crypt('Admin123!ChangeMe', gen_salt('bf', 10))
FROM inserted_user
ON CONFLICT (user_id) DO NOTHING;
