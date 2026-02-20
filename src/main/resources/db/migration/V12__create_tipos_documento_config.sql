-- Migration: Create tipos_documento_config table
-- Date: 2026-02-11
-- Description: Creates configuration table for institutional document types with configurable mandatory fields

CREATE TABLE IF NOT EXISTS tipos_documento_config (
    codigo VARCHAR(100) PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    categoria VARCHAR(100),
    obrigatorio BOOLEAN NOT NULL DEFAULT TRUE,
    numero_documento_obrigatorio BOOLEAN NOT NULL DEFAULT TRUE,
    data_emissao_obrigatoria BOOLEAN NOT NULL DEFAULT TRUE,
    data_validade_obrigatoria BOOLEAN NOT NULL DEFAULT TRUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    ordem INTEGER,
    descricao TEXT,
    formatos_aceitos VARCHAR(200) DEFAULT '.pdf,.jpg,.jpeg,.png',
    tamanho_maximo_mb INTEGER DEFAULT 5,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL,
    data_atualizacao TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tipos_documento_ativo ON tipos_documento_config(ativo);
CREATE INDEX IF NOT EXISTS idx_tipos_documento_categoria ON tipos_documento_config(categoria);

-- Add comments
COMMENT ON TABLE tipos_documento_config IS 'Configuração de tipos de documentos institucionais';
COMMENT ON COLUMN tipos_documento_config.codigo IS 'Código único do tipo de documento';
COMMENT ON COLUMN tipos_documento_config.obrigatorio IS 'Indica se o documento é obrigatório para a instituição';
COMMENT ON COLUMN tipos_documento_config.numero_documento_obrigatorio IS 'Indica se o número do documento é campo obrigatório';
COMMENT ON COLUMN tipos_documento_config.data_emissao_obrigatoria IS 'Indica se a data de emissão é campo obrigatório';
COMMENT ON COLUMN tipos_documento_config.data_validade_obrigatoria IS 'Indica se a data de validade é campo obrigatório';

-- Seed data: Documentos Institucionais
INSERT INTO tipos_documento_config (codigo, nome, categoria, obrigatorio, numero_documento_obrigatorio, data_emissao_obrigatoria, data_validade_obrigatoria, ordem, descricao, data_criacao, data_atualizacao) VALUES
('CARTAO_CNPJ', 'Cartão do CNPJ', 'INSTITUCIONAL', TRUE, TRUE, TRUE, FALSE, 10, 'Cartão de CNPJ da instituição atualizado', NOW(), NOW()),
('ESTATUTO_SOCIAL', 'Estatuto Social', 'INSTITUCIONAL', TRUE, FALSE, TRUE, FALSE, 20, 'Estatuto social registrado em cartório', NOW(), NOW()),
('ALVARA_FUNCIONAMENTO', 'Alvará de Funcionamento', 'INSTITUCIONAL', TRUE, TRUE, TRUE, TRUE, 30, 'Alvará de funcionamento válido', NOW(), NOW()),
('DECLARACAO_UTILIDADE_PUBLICA', 'Declaração de Utilidade Pública Municipal', 'INSTITUCIONAL', FALSE, TRUE, TRUE, FALSE, 40, 'Declaração de utilidade pública municipal (se aplicável)', NOW(), NOW()),
('ATA_ELEICAO_DIRETORIA', 'Ata da Última Eleição de Diretoria', 'INSTITUCIONAL', TRUE, FALSE, TRUE, FALSE, 50, 'Ata da última eleição de diretoria registrada', NOW(), NOW()),
('COMPROVANTE_INSCRICAO_CONSELHO', 'Comprovante de Inscrição no Conselho Municipal', 'INSTITUCIONAL', TRUE, TRUE, TRUE, TRUE, 60, 'Comprovante de inscrição no conselho municipal competente', NOW(), NOW()),
('COMPROVANTE_ENDERECO_INSTITUICAO', 'Comprovante de Endereço', 'INSTITUCIONAL', TRUE, FALSE, TRUE, FALSE, 70, 'Comprovante de endereço da instituição (conta de luz, água ou telefone)', NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- Seed data: Certidões Negativas da Instituição
INSERT INTO tipos_documento_config (codigo, nome, categoria, obrigatorio, numero_documento_obrigatorio, data_emissao_obrigatoria, data_validade_obrigatoria, ordem, descricao, data_criacao, data_atualizacao) VALUES
('CERTIDAO_TRIBUTOS_FEDERAIS', 'Certidão Negativa de Tributos Federais', 'CERTIDAO', TRUE, TRUE, TRUE, TRUE, 100, 'Certidão negativa de débitos relativos aos tributos federais', NOW(), NOW()),
('CERTIFICADO_FGTS', 'Certificado de Regularidade do FGTS', 'CERTIDAO', TRUE, TRUE, TRUE, TRUE, 110, 'Certificado de regularidade do FGTS (CRF)', NOW(), NOW()),
('CERTIDAO_DEBITOS_TRABALHISTAS', 'Certidão Negativa de Débitos Trabalhistas', 'CERTIDAO', TRUE, TRUE, TRUE, TRUE, 120, 'Certidão negativa de débitos trabalhistas (CNDT)', NOW(), NOW()),
('CERTIDAO_DEBITOS_MUNICIPAIS', 'Certidão Negativa de Débitos Municipais', 'CERTIDAO', TRUE, TRUE, TRUE, TRUE, 130, 'Certidão negativa de débitos municipais', NOW(), NOW()),
('CERTIDAO_TCE_INSTITUICAO', 'Certidão Negativa do TCE/MT - Instituição', 'CERTIDAO', TRUE, TRUE, TRUE, TRUE, 140, 'Certidão negativa do Tribunal de Contas do Estado - Pessoa Jurídica', NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;

-- Seed data: Documentos de Dirigente
INSERT INTO tipos_documento_config (codigo, nome, categoria, obrigatorio, numero_documento_obrigatorio, data_emissao_obrigatoria, data_validade_obrigatoria, ordem, descricao, data_criacao, data_atualizacao) VALUES
('RG_DIRIGENTE', 'RG', 'DOCUMENTO_PESSOAL', FALSE, TRUE, TRUE, FALSE, 200, 'RG do dirigente da instituição', NOW(), NOW()),
('CPF_DIRIGENTE', 'CPF', 'DOCUMENTO_PESSOAL', FALSE, TRUE, TRUE, FALSE, 210, 'CPF do dirigente da instituição', NOW(), NOW()),
('COMPROVANTE_ENDERECO_DIRIGENTE', 'Comprovante de Endereço', 'DOCUMENTO_PESSOAL', FALSE, FALSE, TRUE, FALSE, 220, 'Comprovante de endereço do dirigente', NOW(), NOW()),
('CERTIDAO_TCE_DIRIGENTE', 'Certidão Negativa do TCE/MT - Pessoa Física', 'DOCUMENTO_PESSOAL', FALSE, TRUE, TRUE, TRUE, 230, 'Certidão negativa do Tribunal de Contas do Estado - Pessoa Física', NOW(), NOW())
ON CONFLICT (codigo) DO NOTHING;
