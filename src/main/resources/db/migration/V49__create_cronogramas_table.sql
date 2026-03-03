-- V49: Create cronogramas table (safe re-do with IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS cronogramas (
    id            VARCHAR(36)  NOT NULL PRIMARY KEY,
    meta_id       VARCHAR(36)  NOT NULL,
    data_prevista DATE,
    atividade     TEXT,
    create_time   TIMESTAMPTZ,
    update_time   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cronogramas_meta_id ON cronogramas(meta_id);

-- Also ensure V48 columns exist (safe re-apply)
ALTER TABLE metas ADD COLUMN IF NOT EXISTS periodo VARCHAR(20);
ALTER TABLE itens ADD COLUMN IF NOT EXISTS periodo VARCHAR(20);

