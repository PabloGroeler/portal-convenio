-- V14: Fix usuarios sequence to be in sync with existing data
-- This ensures the sequence value is higher than the maximum ID in the table

-- Reset the sequence to the maximum ID + 1
SELECT setval('usuarios_seq', COALESCE((SELECT MAX(id) FROM usuarios), 0) + 1, false);

-- Verify the sequence is correctly linked to the table
ALTER SEQUENCE usuarios_seq OWNED BY usuarios.id;

-- Ensure the table's id column uses the sequence
ALTER TABLE usuarios ALTER COLUMN id SET DEFAULT nextval('usuarios_seq');

-- Add comment explaining the fix
COMMENT ON SEQUENCE usuarios_seq IS 'Sequence for usuarios.id - fixed to sync with existing data on 2026-02-12';
