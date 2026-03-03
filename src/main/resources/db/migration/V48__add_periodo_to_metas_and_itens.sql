-- RF06 – Cronograma de Execução
-- Adds 'periodo' (e.g. "Jan/2025") to metas and itens so the schedule table can be derived

ALTER TABLE metas ADD COLUMN IF NOT EXISTS periodo VARCHAR(20);
ALTER TABLE itens ADD COLUMN IF NOT EXISTS periodo VARCHAR(20);

