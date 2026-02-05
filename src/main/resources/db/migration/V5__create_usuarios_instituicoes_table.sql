-- Criar tabela de relacionamento entre usuários e instituições (N para N)
CREATE TABLE IF NOT EXISTS usuarios_instituicoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    instituicao_id VARCHAR(255) NOT NULL,
    data_vinculo TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT uk_usuario_instituicao UNIQUE (usuario_id, instituicao_id)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_usuarios_instituicoes_usuario ON usuarios_instituicoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_instituicoes_instituicao ON usuarios_instituicoes(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_instituicoes_ativo ON usuarios_instituicoes(ativo);

-- Comentários
COMMENT ON TABLE usuarios_instituicoes IS 'Relacionamento N para N entre usuários e instituições';
COMMENT ON COLUMN usuarios_instituicoes.usuario_id IS 'ID do usuário';
COMMENT ON COLUMN usuarios_instituicoes.instituicao_id IS 'ID da instituição';
COMMENT ON COLUMN usuarios_instituicoes.data_vinculo IS 'Data e hora do vínculo';
COMMENT ON COLUMN usuarios_instituicoes.ativo IS 'Se o vínculo está ativo';

