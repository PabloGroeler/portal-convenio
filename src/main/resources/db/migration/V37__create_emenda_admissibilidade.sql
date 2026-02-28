-- V37: Create emenda_admissibilidade table

CREATE TABLE emenda_admissibilidade (
    id               BIGSERIAL PRIMARY KEY,
    emenda_id        VARCHAR(36)  NOT NULL REFERENCES emendas(id) ON DELETE CASCADE,
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE', -- PENDENTE, APROVADA, REPROVADA
    observacao       TEXT,
    analista_id      BIGINT       NOT NULL REFERENCES usuarios(id),
    data_analise     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Only one record per emenda (latest wins via upsert in service)
CREATE INDEX idx_emenda_admissibilidade_emenda_id ON emenda_admissibilidade (emenda_id);

