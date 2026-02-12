-- V13: Add document approval/rejection fields to documentos_institucionais table

ALTER TABLE documentos_institucionais
    ADD COLUMN IF NOT EXISTS status_documento VARCHAR(50) DEFAULT 'PENDENTE_ENVIO',
    ADD COLUMN IF NOT EXISTS observacoes TEXT,
    ADD COLUMN IF NOT EXISTS motivo_reprovacao TEXT,
    ADD COLUMN IF NOT EXISTS data_aprovacao TIMESTAMP,
    ADD COLUMN IF NOT EXISTS data_reprovacao TIMESTAMP,
    ADD COLUMN IF NOT EXISTS numero_documento VARCHAR(100),
    ADD COLUMN IF NOT EXISTS data_emissao TIMESTAMP,
    ADD COLUMN IF NOT EXISTS data_validade TIMESTAMP;

-- Update existing records to have default status
UPDATE documentos_institucionais
SET status_documento = 'ENVIADO'
WHERE status_documento IS NULL;

-- Add comment to explain status values
COMMENT ON COLUMN documentos_institucionais.status_documento IS
'Status do documento: PENDENTE_ENVIO, ENVIADO, EM_ANALISE, APROVADO, REPROVADO, VENCIDO, SUBSTITUIDO';
