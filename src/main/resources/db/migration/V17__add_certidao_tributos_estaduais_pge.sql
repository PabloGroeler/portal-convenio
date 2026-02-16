-- Migration: Add Certidão Negativa de Tributos Estaduais – PGE
-- Date: 2026-02-16
-- Description: Adds new document type for State Tax Clearance Certificate from PGE (Procuradoria Geral do Estado)

INSERT INTO tipos_documento_config (
    codigo,
    nome,
    categoria,
    obrigatorio,
    numero_documento_obrigatorio,
    data_emissao_obrigatoria,
    data_validade_obrigatoria,
    ativo,
    ordem,
    descricao,
    formatos_aceitos,
    tamanho_maximo_mb,
    data_criacao,
    data_atualizacao
) VALUES (
    'CERTIDAO_TRIBUTOS_ESTADUAIS_PGE',
    'Certidão Negativa de Tributos Estaduais – PGE',
    'CERTIDAO',
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    TRUE,
    135,
    'Certidão negativa de débitos relativos aos tributos estaduais emitida pela Procuradoria Geral do Estado',
    '.pdf,.jpg,.jpeg,.png',
    5,
    NOW(),
    NOW()
);

-- Add comment
COMMENT ON TABLE tipos_documento_config IS 'Configuração de tipos de documentos institucionais - Atualizado em 2026-02-16 com Certidão PGE';
