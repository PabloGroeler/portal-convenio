-- V32: Add emenda_id to plano_trabalho if it doesn't exist yet
-- (For databases where V30 ran before emenda_id was added)
ALTER TABLE plano_trabalho ADD COLUMN IF NOT EXISTS emenda_id VARCHAR(36);

-- Create unique index on emenda_id (only non-null values, to allow multiple plans without an emenda)
CREATE UNIQUE INDEX IF NOT EXISTS idx_plano_emenda
    ON plano_trabalho (emenda_id)
    WHERE emenda_id IS NOT NULL;
