-- Migration: Create audit logs table
-- Date: 2026-02-16
-- Description: RF-01.4 - Sistema de Logs de Auditoria

CREATE TABLE logs_auditoria (
    id BIGSERIAL PRIMARY KEY,
    data_hora TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario_id BIGINT,
    usuario_nome VARCHAR(200),
    usuario_email VARCHAR(200),
    ip_origem VARCHAR(45),
    acao VARCHAR(50) NOT NULL,
    entidade VARCHAR(100),
    registro_id VARCHAR(100),
    detalhes TEXT,
    valores_anteriores TEXT,
    valores_novos TEXT,
    resultado VARCHAR(20) DEFAULT 'SUCESSO',
    mensagem_erro TEXT,
    user_agent VARCHAR(500),
    sessao_id VARCHAR(100),
    duracao_ms BIGINT
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON logs_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_data ON logs_auditoria(data_hora);
CREATE INDEX IF NOT EXISTS idx_audit_acao ON logs_auditoria(acao);
CREATE INDEX IF NOT EXISTS idx_audit_entidade ON logs_auditoria(entidade);
CREATE INDEX IF NOT EXISTS idx_audit_registro ON logs_auditoria(entidade, registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_resultado ON logs_auditoria(resultado);

-- Comentários
COMMENT ON TABLE logs_auditoria IS 'Tabela de logs de auditoria do sistema - RF-01.4';
COMMENT ON COLUMN logs_auditoria.acao IS 'Tipos: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, UPLOAD, DOWNLOAD, EXPORT, ACESSO_NEGADO';
COMMENT ON COLUMN logs_auditoria.resultado IS 'Valores: SUCESSO, FALHA, ERRO';
