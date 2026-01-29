-- JIRA 9 — Criar Status do Ciclo de Vida da Emenda

ALTER TABLE emendas
  ADD COLUMN IF NOT EXISTS status_ciclo_vida VARCHAR(30) NOT NULL DEFAULT 'Pendente';

CREATE INDEX IF NOT EXISTS idx_emendas_status_ciclo_vida ON emendas (status_ciclo_vida);

