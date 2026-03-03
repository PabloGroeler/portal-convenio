-- V43: Add tipo_transferencia and dotacao_orcamentaria to emendas
-- Also create dotacoes_orcamentarias reference table

ALTER TABLE emendas
    ADD COLUMN IF NOT EXISTS tipo_transferencia VARCHAR(20) DEFAULT 'Direta',
    ADD COLUMN IF NOT EXISTS dotacao_orcamentaria_id BIGINT,
    ADD COLUMN IF NOT EXISTS dotacao_orcamentaria_texto VARCHAR(500);

-- Tabela de dotações orçamentárias
CREATE TABLE IF NOT EXISTS dotacoes_orcamentarias (
    id               BIGSERIAL PRIMARY KEY,
    codigo_reduzido  VARCHAR(20)  NOT NULL,
    dotacao          VARCHAR(500) NOT NULL,
    descricao        VARCHAR(500),
    exercicio        INTEGER      NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
    ativo            BOOLEAN      NOT NULL DEFAULT TRUE,
    data_criacao     TIMESTAMP    DEFAULT NOW(),
    data_atualizacao TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dotacoes_codigo_reduzido ON dotacoes_orcamentarias (codigo_reduzido);
CREATE INDEX IF NOT EXISTS idx_dotacoes_dotacao         ON dotacoes_orcamentarias USING gin(to_tsvector('portuguese', dotacao));

