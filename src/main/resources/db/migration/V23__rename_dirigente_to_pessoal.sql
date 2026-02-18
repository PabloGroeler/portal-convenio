-- V23: Alterar categoria de DIRIGENTE para PESSOAL

-- Atualizar a categoria dos documentos pessoais de "DIRIGENTE" para "PESSOAL"
UPDATE tipos_documento_config
SET categoria = 'PESSOAL',
    data_atualizacao = NOW()
WHERE categoria = 'DIRIGENTE';

-- Comentário explicativo
COMMENT ON COLUMN tipos_documento_config.categoria IS 'Categoria do documento: INSTITUCIONAL, CERTIDAO, PESSOAL';
