-- Drop unique constraint on instituicoes.cnpj (temporary)
-- The constraint name in your error was: instituicoes_cnpj_key

ALTER TABLE instituicoes
  DROP CONSTRAINT IF EXISTS instituicoes_cnpj_key;

-- In case a unique index was created instead of a constraint, drop it too.
DROP INDEX IF EXISTS idx_instituicoes_cnpj;

-- Recreate a non-unique index for lookups.
CREATE INDEX IF NOT EXISTS idx_instituicoes_cnpj ON instituicoes (cnpj);

