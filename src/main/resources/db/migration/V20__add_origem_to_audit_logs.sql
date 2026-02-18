-- Migration: Add origem column to logs_auditoria
-- Date: 2026-02-17
-- Description: Adiciona coluna origem para diferenciar logs da aplicação vs triggers do banco

-- Adicionar coluna origem se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'logs_auditoria'
        AND column_name = 'origem'
    ) THEN
        ALTER TABLE logs_auditoria
        ADD COLUMN origem VARCHAR(50) DEFAULT 'APPLICATION';

        RAISE NOTICE 'Coluna origem adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna origem já existe, nada a fazer.';
    END IF;
END $$;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_logs_auditoria_origem ON logs_auditoria(origem);

-- Comentário
COMMENT ON COLUMN logs_auditoria.origem IS 'Origem do log: APPLICATION (via código) ou DATABASE_TRIGGER (via trigger SQL)';
