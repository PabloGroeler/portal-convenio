-- Seed initial "tipos de emenda" rows
-- JIRA 1 — Criar Classificação de Tipos de Emenda
-- Idempotent: uses ON CONFLICT(codigo)

INSERT INTO tipos_emenda (codigo, nome, ativo, ordem, create_time, update_time)
VALUES
  ('EMENDA_BANCADA', 'Emenda de Bancada', TRUE, 10, now(), now()),
  ('EMENDA_COMISSAO', 'Emenda de Comissão', TRUE, 20, now(), now()),
  ('EMENDA_PIX', 'Emenda Pix', TRUE, 30, now(), now()),
  ('INDIVIDUAL_FINALIDADE_DEFINIDA', 'Emenda Individual – Transferências com Finalidade Definida', TRUE, 40, now(), now()),
  ('INDIVIDUAL_TRANSFERENCIA_ESPECIAL', 'Emenda Individual – Transferências Especiais', TRUE, 50, now(), now())
ON CONFLICT (codigo)
DO UPDATE SET
  nome = EXCLUDED.nome,
  ativo = EXCLUDED.ativo,
  ordem = EXCLUDED.ordem,
  update_time = now();

