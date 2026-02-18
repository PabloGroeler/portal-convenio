-- V21: Adicionar configuração para Certidão Negativa de Tributos Estaduais – PGE

-- Inserir configuração do novo tipo de documento
INSERT INTO tipos_documento_config (
    codigo,
    nome,
    numero_documento_obrigatorio,
    data_emissao_obrigatoria,
    data_validade_obrigatoria,
    ativo,
    ordem,
    data_criacao,
    data_atualizacao
) VALUES (
    'CERTIDAO_TRIBUTOS_ESTADUAIS_PGE',
    'Certidão Negativa de Tributos Estaduais – PGE',
    true,  -- Número do documento obrigatório
    true,  -- Data de emissão obrigatória
    true,  -- Data de validade obrigatória
    true,  -- Ativo
    82,    -- Ordem (após CERTIDAO_TRIBUTOS_FEDERAIS que é 81)
    now(),
    now()
) ON CONFLICT (codigo) DO NOTHING;

-- Comentário
COMMENT ON TABLE tipos_documento_config IS 'Configuração dos tipos de documentos institucionais e suas regras de validação';
