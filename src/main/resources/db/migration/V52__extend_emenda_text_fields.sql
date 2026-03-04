-- Extend text fields on emendas table to support 5000 characters
ALTER TABLE emendas ALTER COLUMN descricao TYPE VARCHAR(5000);
ALTER TABLE emendas ALTER COLUMN justificativa TYPE VARCHAR(5000);

