-- Criar tabela de documentos institucionais
CREATE TABLE IF NOT EXISTS documentos_institucionais (
    id VARCHAR(36) PRIMARY KEY,
    id_instituicao VARCHAR(100) NOT NULL,

    -- Dados do documento
    nome_arquivo VARCHAR(255) NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(100) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    descricao TEXT,

    -- Armazenamento
    caminho_arquivo VARCHAR(500) NOT NULL,

    -- Auditoria
    data_upload TIMESTAMP WITH TIME ZONE NOT NULL,
    usuario_upload VARCHAR(100),
    data_criacao TIMESTAMP WITH TIME ZONE,
    data_atualizacao TIMESTAMP WITH TIME ZONE,

    -- Foreign Key
    CONSTRAINT fk_documento_instituicao FOREIGN KEY (id_instituicao) REFERENCES instituicoes(id_instituicao) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_documentos_instituicao ON documentos_institucionais(id_instituicao);
CREATE INDEX IF NOT EXISTS idx_documentos_tipo ON documentos_institucionais(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_documentos_data_upload ON documentos_institucionais(data_upload DESC);

-- Comentários
COMMENT ON TABLE documentos_institucionais IS 'Documentos anexados às instituições';
COMMENT ON COLUMN documentos_institucionais.tipo_documento IS 'Tipo: Estatuto, Ata, Certidão, Comprovante, Outro';
COMMENT ON COLUMN documentos_institucionais.caminho_arquivo IS 'Caminho relativo do arquivo no servidor';

