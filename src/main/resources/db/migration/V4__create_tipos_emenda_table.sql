-- Create table of "tipos de emenda" (classification catalog)
-- JIRA 1 — Criar Classificação de Tipos de Emenda

CREATE TABLE IF NOT EXISTS tipos_emenda (
  id BIGSERIAL PRIMARY KEY,
  codigo VARCHAR(80) NOT NULL,
  nome VARCHAR(200) NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  ordem INT NOT NULL DEFAULT 0,
  create_time TIMESTAMPTZ,
  update_time TIMESTAMPTZ
);

-- Ensure stable unique lookup by "codigo"
ALTER TABLE tipos_emenda
  ADD CONSTRAINT tipos_emenda_codigo_unique UNIQUE (codigo);

CREATE INDEX IF NOT EXISTS idx_tipos_emenda_ativo_ordem
  ON tipos_emenda (ativo, ordem);

