-- V38: Add secretaria_destino to emendas and new admissibilidade status values

ALTER TABLE emendas ADD COLUMN IF NOT EXISTS secretaria_destino VARCHAR(255);

