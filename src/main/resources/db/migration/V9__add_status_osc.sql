-- RF-02.3 - Status da OSC
-- Adicionar coluna status_osc na tabela instituicoes (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'instituicoes' AND column_name = 'status_osc') THEN
        ALTER TABLE instituicoes ADD COLUMN status_osc VARCHAR(50) DEFAULT 'EM_CADASTRO';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'instituicoes' AND column_name = 'justificativa_suspensao') THEN
        ALTER TABLE instituicoes ADD COLUMN justificativa_suspensao TEXT;
    END IF;
END $$;

-- Criar tabela de histórico de status (idempotente)
CREATE TABLE IF NOT EXISTS status_historico (
    id VARCHAR(255) PRIMARY KEY,
    instituicao_id VARCHAR(255) NOT NULL,
    status_anterior VARCHAR(50) NOT NULL,
    status_novo VARCHAR(50) NOT NULL,
    data_alteracao TIMESTAMP NOT NULL,
    usuario_responsavel VARCHAR(255) NOT NULL,
    justificativa TEXT,
    observacoes TEXT,
    CONSTRAINT fk_status_historico_instituicao
        FOREIGN KEY (instituicao_id)
        REFERENCES instituicoes(id_instituicao)
        ON DELETE CASCADE
);

-- Criar índices para consultas rápidas (idempotente)
CREATE INDEX IF NOT EXISTS idx_status_historico_instituicao ON status_historico(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_status_historico_data ON status_historico(data_alteracao DESC);
CREATE INDEX IF NOT EXISTS idx_instituicoes_status ON instituicoes(status_osc);

-- Atualizar instituições existentes com status inicial
UPDATE instituicoes SET status_osc = 'EM_CADASTRO' WHERE status_osc IS NULL;

-- Comentários nas colunas
COMMENT ON COLUMN instituicoes.status_osc IS 'Status atual da OSC no sistema';
COMMENT ON COLUMN instituicoes.justificativa_suspensao IS 'Justificativa quando status for SUSPENSA';
COMMENT ON TABLE status_historico IS 'Histórico de alterações de status das instituições';

