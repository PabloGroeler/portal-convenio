-- V46: Add funcao_codigo column to emendas table
ALTER TABLE emendas ADD COLUMN IF NOT EXISTS funcao_codigo VARCHAR(10);

