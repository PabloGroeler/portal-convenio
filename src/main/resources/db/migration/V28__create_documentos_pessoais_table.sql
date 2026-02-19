-- V29: Criar tabela de documentos pessoais dos dirigentes

CREATE TABLE IF NOT EXISTS documentos_pessoais (
    id VARCHAR(36) PRIMARY KEY,
    id_dirigente VARCHAR(36) NOT NULL,

    -- Tipo de documento
    tipo_documento VARCHAR(100) NOT NULL,

    -- Informações do arquivo
    nome_arquivo VARCHAR(255) NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,

    -- Metadados do documento
    numero_documento VARCHAR(50),
    data_emissao DATE,
    data_validade DATE,
    descricao VARCHAR(500),

    -- Controle de upload
    data_upload TIMESTAMP NOT NULL,
    usuario_upload VARCHAR(200),

    -- Status do documento
    status_documento VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    observacoes VARCHAR(1000),
    motivo_reprovacao VARCHAR(1000),
    data_aprovacao TIMESTAMP,
    data_reprovacao TIMESTAMP,
    usuario_aprovador VARCHAR(200),
    usuario_reprovador VARCHAR(200),

    -- Auditoria
    data_criacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key
    CONSTRAINT fk_doc_pessoal_dirigente FOREIGN KEY (id_dirigente)
        REFERENCES dirigentes(id) ON DELETE CASCADE
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_doc_pessoal_dirigente ON documentos_pessoais(id_dirigente);
CREATE INDEX IF NOT EXISTS idx_doc_pessoal_tipo ON documentos_pessoais(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_doc_pessoal_status ON documentos_pessoais(status_documento);

-- Comentários
COMMENT ON TABLE documentos_pessoais IS 'Documentos pessoais dos dirigentes (RG, CNH, Comprovante de Endereço, Certidão TCE, etc)';
COMMENT ON COLUMN documentos_pessoais.tipo_documento IS 'Tipo: RG, CNH, DOCUMENTO_COM_FOTO, COMPROVANTE_ENDERECO, CERTIDAO_NEGATIVA_TCE, DOCUMENTO_IDENTIFICACAO_FOTO';
COMMENT ON COLUMN documentos_pessoais.status_documento IS 'Status: PENDENTE, APROVADO, REPROVADO';
