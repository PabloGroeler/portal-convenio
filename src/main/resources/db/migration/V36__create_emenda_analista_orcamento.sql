-- V36: Add ORCAMENTO role and create emenda_analista_orcamento table

-- Add ORCAMENTO to the role check (if using varchar, this is a no-op; if using enum type, alter it)
ALTER TABLE usuarios ALTER COLUMN perfil TYPE VARCHAR(30);

-- Create the assignment table
CREATE TABLE IF NOT EXISTS emenda_analista_orcamento (
    id                BIGSERIAL PRIMARY KEY,
    emenda_id         VARCHAR(36)  NOT NULL REFERENCES emendas(id) ON DELETE CASCADE,
    analista_id       BIGINT       NOT NULL REFERENCES usuarios(id),
    atribuido_por_id  BIGINT       NOT NULL REFERENCES usuarios(id),
    data_atribuicao   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    ativo             BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Enforce only one active analyst per emenda at DB level
CREATE UNIQUE INDEX IF NOT EXISTS uq_emenda_analista_ativo
    ON emenda_analista_orcamento (emenda_id)
    WHERE ativo = TRUE;

CREATE INDEX IF NOT EXISTS idx_emenda_analista_emenda_id ON emenda_analista_orcamento (emenda_id);
CREATE INDEX IF NOT EXISTS idx_emenda_analista_analista_id ON emenda_analista_orcamento (analista_id);


