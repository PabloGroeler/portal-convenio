-- Create dedicated sequence for usuarios_instituicoes if it doesn't exist
-- (PostgreSQL SERIAL already creates usuarios_instituicoes_id_seq, but ensure it's correct)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'usuarios_instituicoes_id_seq') THEN
        CREATE SEQUENCE usuarios_instituicoes_id_seq START 1;
        ALTER TABLE usuarios_instituicoes ALTER COLUMN id SET DEFAULT nextval('usuarios_instituicoes_id_seq');
    END IF;
END $$;

-- Always reset to max(id)+1 to fix any existing drift
SELECT setval(
    'usuarios_instituicoes_id_seq',
    COALESCE((SELECT MAX(id) FROM usuarios_instituicoes), 0) + 1,
    false
);

