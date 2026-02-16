-- V16: Re-sync usuarios sequence (fix duplicate key constraint violation)
-- This fixes the error: duplicate key value violates unique constraint "usuarios_pkey"
-- The sequence gets out of sync when data is inserted manually or restored from backup

-- Get the current max ID and set sequence to max + 1
DO $$
DECLARE
    max_id BIGINT;
    next_val BIGINT;
BEGIN
    -- Get max ID from usuarios table
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM usuarios;

    -- Calculate next value
    next_val := max_id + 1;

    -- Set sequence to next available ID
    -- IMPORTANT: Third parameter TRUE means "is_called" - sequence will return next_val on next nextval()
    -- If we use FALSE, nextval() would return next_val-1 on first call (causing duplicate)
    PERFORM setval('usuarios_seq', next_val, true);

    -- Log the operation
    RAISE NOTICE 'usuarios_seq reset to % (max usuarios.id was %). Next INSERT will use ID >= %',
                 next_val, max_id, next_val;
END $$;

-- Ensure sequence is owned by the table column
ALTER SEQUENCE usuarios_seq OWNED BY usuarios.id;

-- Ensure the column uses the sequence
ALTER TABLE usuarios ALTER COLUMN id SET DEFAULT nextval('usuarios_seq');

-- Verify and report
SELECT
    'usuarios_seq' as sequence_name,
    last_value as current_value,
    (SELECT MAX(id) FROM usuarios) as max_table_id,
    last_value >= (SELECT COALESCE(MAX(id), 0) FROM usuarios) as is_synced,
    'Next INSERT will use ID: ' || (last_value + 1) as next_id_info
FROM usuarios_seq;

COMMENT ON SEQUENCE usuarios_seq IS 'Auto-increment sequence for usuarios.id - resynced on 2026-02-14 to fix duplicate key error';
