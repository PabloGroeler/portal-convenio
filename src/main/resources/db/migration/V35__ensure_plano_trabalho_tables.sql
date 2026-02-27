-- V35: Ensure plano_trabalho and plano_trabalho_historico tables exist with all required columns
-- Uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS so it is safe to run on any database state

CREATE TABLE IF NOT EXISTS plano_trabalho (
    id TEXT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    instituicao_id VARCHAR(64),
    emenda_id VARCHAR(36),
    valor NUMERIC(18,2),
    status VARCHAR(50),
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);

-- Add emenda_id if the table existed before that column was introduced
ALTER TABLE plano_trabalho ADD COLUMN IF NOT EXISTS emenda_id VARCHAR(36);

-- Unique partial index: one plan per emenda (nulls ignored)
CREATE UNIQUE INDEX IF NOT EXISTS idx_plano_emenda
    ON plano_trabalho (emenda_id)
    WHERE emenda_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS plano_trabalho_historico (
    id TEXT PRIMARY KEY,
    plano_trabalho_id TEXT NOT NULL,
    acao VARCHAR(32) NOT NULL,
    motivo TEXT,
    usuario VARCHAR(128),
    data_hora TIMESTAMP WITH TIME ZONE
);
