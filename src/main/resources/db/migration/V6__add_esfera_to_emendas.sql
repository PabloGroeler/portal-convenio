-- JIRA 6 — Criar Classificação de Esfera da Emenda
-- Adds a new column "esfera" to emendas.
-- Values expected: Municipal | Estadual | Federal

ALTER TABLE emendas
  ADD COLUMN IF NOT EXISTS esfera VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_emendas_esfera ON emendas (esfera);

