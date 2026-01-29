-- JIRA 7 — Campo “Existe Convênio?” no Cadastro de Emenda

ALTER TABLE emendas
  ADD COLUMN IF NOT EXISTS existe_convenio BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS numero_convenio VARCHAR(16),
  ADD COLUMN IF NOT EXISTS ano_convenio INTEGER;

CREATE INDEX IF NOT EXISTS idx_emendas_existe_convenio ON emendas (existe_convenio);
CREATE INDEX IF NOT EXISTS idx_emendas_ano_convenio ON emendas (ano_convenio);

