-- V22: Adicionar campos de aprovação da instituição

-- Adicionar colunas se não existirem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='instituicoes' AND column_name='status_aprovacao') THEN
        ALTER TABLE instituicoes ADD COLUMN status_aprovacao VARCHAR(50) DEFAULT 'PENDENTE';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='instituicoes' AND column_name='data_aprovacao') THEN
        ALTER TABLE instituicoes ADD COLUMN data_aprovacao TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='instituicoes' AND column_name='data_reprovacao') THEN
        ALTER TABLE instituicoes ADD COLUMN data_reprovacao TIMESTAMP;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='instituicoes' AND column_name='observacoes_aprovacao') THEN
        ALTER TABLE instituicoes ADD COLUMN observacoes_aprovacao TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='instituicoes' AND column_name='motivo_reprovacao') THEN
        ALTER TABLE instituicoes ADD COLUMN motivo_reprovacao TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='instituicoes' AND column_name='usuario_aprovador') THEN
        ALTER TABLE instituicoes ADD COLUMN usuario_aprovador VARCHAR(256);
    END IF;
END $$;

-- Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_instituicoes_status_aprovacao ON instituicoes(status_aprovacao);

-- Comentários para documentação (podem ser executados múltiplas vezes sem problema)
COMMENT ON COLUMN instituicoes.status_aprovacao IS 'Status da aprovação cadastral: PENDENTE, EM_ANALISE, APROVADA, REPROVADA';
COMMENT ON COLUMN instituicoes.data_aprovacao IS 'Data em que a instituição foi aprovada';
COMMENT ON COLUMN instituicoes.data_reprovacao IS 'Data em que a instituição foi reprovada';
COMMENT ON COLUMN instituicoes.observacoes_aprovacao IS 'Observações do gestor na aprovação';
COMMENT ON COLUMN instituicoes.motivo_reprovacao IS 'Motivo da reprovação da instituição';
COMMENT ON COLUMN instituicoes.usuario_aprovador IS 'Usuário que aprovou ou reprovou a instituição';
