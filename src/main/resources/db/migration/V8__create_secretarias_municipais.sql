-- JIRA 8 — Gerenciar Cadastro de Secretarias Municipais

CREATE TABLE IF NOT EXISTS secretarias_municipais (
  secretaria_id VARCHAR(100) PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  sigla VARCHAR(20),
  email VARCHAR(200),
  telefone VARCHAR(20),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  create_time TIMESTAMPTZ,
  update_time TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_secretarias_municipais_nome ON secretarias_municipais (nome);
CREATE INDEX IF NOT EXISTS idx_secretarias_municipais_ativo ON secretarias_municipais (ativo);

