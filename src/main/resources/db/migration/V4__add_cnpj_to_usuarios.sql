-- Migration V4: Add CNPJ column to usuarios table
-- Allows users to register as legal entities (pessoa jurídica)

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cnpj VARCHAR(14);

COMMENT ON COLUMN usuarios.cnpj IS 'CNPJ para pessoa jurídica (14 dígitos sem formatação)';

