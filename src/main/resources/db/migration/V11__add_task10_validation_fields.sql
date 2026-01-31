-- Task-10: Add validation fields to emendas table

-- Add numeroEmenda (must be > 0, unique per exercicio)
ALTER TABLE emendas ADD COLUMN numero_emenda INTEGER;

-- Add exercicio (year for composite key)
ALTER TABLE emendas ADD COLUMN exercicio INTEGER;

-- Add previsao_conclusao (completion forecast date)
ALTER TABLE emendas ADD COLUMN previsao_conclusao DATE;

-- Add justificativa (min 20, max 250 chars)
ALTER TABLE emendas ADD COLUMN justificativa VARCHAR(250);

-- Modify description to enforce 250 char limit (was TEXT)
ALTER TABLE emendas ALTER COLUMN description TYPE VARCHAR(250);

-- Create unique index for numero_emenda + exercicio composite key
CREATE UNIQUE INDEX idx_emendas_numero_exercicio ON emendas(numero_emenda, exercicio);

-- Update existing records to have default values
-- Set exercicio to current year for existing records
UPDATE emendas SET exercicio = EXTRACT(YEAR FROM COALESCE(date, CURRENT_DATE)) WHERE exercicio IS NULL;

-- Set numeroEmenda to row number within each exercicio for existing records
WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY exercicio ORDER BY create_time, id) as row_num
    FROM emendas
    WHERE numero_emenda IS NULL
)
UPDATE emendas e
SET numero_emenda = n.row_num
FROM numbered n
WHERE e.id = n.id;

-- Now make the columns NOT NULL
ALTER TABLE emendas ALTER COLUMN numero_emenda SET NOT NULL;
ALTER TABLE emendas ALTER COLUMN exercicio SET NOT NULL;

-- Add check constraint for numero_emenda > 0
ALTER TABLE emendas ADD CONSTRAINT chk_numero_emenda_positive CHECK (numero_emenda > 0);

-- Add check constraint for exercicio > 0
ALTER TABLE emendas ADD CONSTRAINT chk_exercicio_positive CHECK (exercicio > 0);

-- Add check constraint for value > 0
ALTER TABLE emendas ADD CONSTRAINT chk_value_positive CHECK (value > 0);

-- Add check constraint for justificativa length (min 20, max 250)
ALTER TABLE emendas ADD CONSTRAINT chk_justificativa_length
    CHECK (justificativa IS NULL OR (LENGTH(justificativa) >= 20 AND LENGTH(justificativa) <= 250));

