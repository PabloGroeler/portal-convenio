-- =====================================================
-- V19: Audit Triggers para Tabelas Críticas
-- Data: 2026-02-17
-- Descrição: Triggers de auditoria como backup de segurança
--            para operações diretas no banco de dados
-- =====================================================

-- =====================================================
-- 1. ADICIONAR COLUNA 'ORIGEM' NA TABELA DE AUDIT
-- =====================================================
-- Diferencia logs gerados pela aplicação vs triggers
ALTER TABLE logs_auditoria
ADD COLUMN IF NOT EXISTS origem VARCHAR(50) DEFAULT 'APPLICATION';

CREATE INDEX IF NOT EXISTS idx_logs_auditoria_origem
ON logs_auditoria(origem);

COMMENT ON COLUMN logs_auditoria.origem IS
'Origem do log: APPLICATION (Java) ou DATABASE_TRIGGER (SQL direto)';

-- =====================================================
-- 2. FUNCTION GENÉRICA DE AUDIT PARA USUARIOS
-- =====================================================
CREATE OR REPLACE FUNCTION audit_usuarios_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_nome VARCHAR(255);
BEGIN
    -- Para INSERT e UPDATE, pega o nome do NEW
    -- Para DELETE, pega do OLD
    IF (TG_OP = 'DELETE') THEN
        v_usuario_nome := OLD.nome_usuario;
    ELSE
        v_usuario_nome := NEW.nome_usuario;
    END IF;

    -- DELETE
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO logs_auditoria (
            origem,
            data_hora,
            acao,
            entidade,
            registro_id,
            usuario_id,
            usuario_nome,
            valores_anteriores,
            resultado,
            detalhes
        ) VALUES (
            'DATABASE_TRIGGER',
            NOW(),
            'DELETE',
            'Usuario',
            OLD.id::TEXT,
            OLD.id,
            OLD.nome_usuario,
            jsonb_build_object(
                'id', OLD.id,
                'username', OLD.nome_usuario,
                'email', OLD.email,
                'role', OLD.perfil,
                'status', OLD.status_usuario,
                'cpf', '***MASKED***',  -- Não expõe dados sensíveis
                'cnpj', '***MASKED***'
            )::TEXT,
            'SUCESSO',
            'Registro deletado via SQL direto (não pela aplicação)'
        );
        RETURN OLD;

    -- UPDATE
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Só loga se houver mudanças reais (ignora updates sem alteração)
        IF row(OLD.*) IS DISTINCT FROM row(NEW.*) THEN
            -- Verifica se é mudança crítica (role, status)
            IF OLD.perfil IS DISTINCT FROM NEW.perfil
               OR OLD.status_usuario IS DISTINCT FROM NEW.status_usuario THEN
                INSERT INTO logs_auditoria (
                    origem,
                    data_hora,
                    acao,
                    entidade,
                    registro_id,
                    usuario_id,
                    usuario_nome,
                    valores_anteriores,
                    valores_novos,
                    resultado,
                    detalhes
                ) VALUES (
                    'DATABASE_TRIGGER',
                    NOW(),
                    'UPDATE',
                    'Usuario',
                    NEW.id::TEXT,
                    NEW.id,
                    NEW.nome_usuario,
                    jsonb_build_object(
                        'role', OLD.perfil,
                        'status', OLD.status_usuario
                    )::TEXT,
                    jsonb_build_object(
                        'role', NEW.perfil,
                        'status', NEW.status_usuario
                    )::TEXT,
                    'SUCESSO',
                    'Mudança crítica em usuário via SQL direto'
                );
            END IF;
        END IF;
        RETURN NEW;

    -- INSERT
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO logs_auditoria (
            origem,
            data_hora,
            acao,
            entidade,
            registro_id,
            usuario_id,
            usuario_nome,
            valores_novos,
            resultado,
            detalhes
        ) VALUES (
            'DATABASE_TRIGGER',
            NOW(),
            'INSERT',
            'Usuario',
            NEW.id::TEXT,
            NEW.id,
            NEW.nome_usuario,
            jsonb_build_object(
                'username', NEW.nome_usuario,
                'email', NEW.email,
                'role', NEW.perfil,
                'status', NEW.status_usuario
            )::TEXT,
            'SUCESSO',
            'Usuário criado via SQL direto (não pela aplicação)'
        );
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION audit_usuarios_trigger() IS
'Trigger function para auditar mudanças diretas na tabela usuarios';

-- =====================================================
-- 3. FUNCTION GENÉRICA DE AUDIT PARA INSTITUIÇÕES
-- =====================================================
CREATE OR REPLACE FUNCTION audit_instituicoes_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- DELETE
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO logs_auditoria (
            origem,
            data_hora,
            acao,
            entidade,
            registro_id,
            valores_anteriores,
            resultado,
            detalhes
        ) VALUES (
            'DATABASE_TRIGGER',
            NOW(),
            'DELETE',
            'Institution',
            OLD.id_instituicao,
            jsonb_build_object(
                'id', OLD.id_instituicao,
                'razaoSocial', OLD.razao_social,
                'cnpj', OLD.cnpj,
                'statusOSC', OLD.status_osc
            )::TEXT,
            'SUCESSO',
            'Instituição deletada via SQL direto (não pela aplicação)'
        );
        RETURN OLD;

    -- UPDATE (apenas mudanças críticas)
    ELSIF (TG_OP = 'UPDATE') THEN
        IF row(OLD.*) IS DISTINCT FROM row(NEW.*) THEN
            -- Verifica se é mudança crítica (status OSC, CNPJ, razão social)
            IF OLD.status_osc IS DISTINCT FROM NEW.status_osc
               OR OLD.cnpj IS DISTINCT FROM NEW.cnpj
               OR OLD.razao_social IS DISTINCT FROM NEW.razao_social THEN
                INSERT INTO logs_auditoria (
                    origem,
                    data_hora,
                    acao,
                    entidade,
                    registro_id,
                    valores_anteriores,
                    valores_novos,
                    resultado,
                    detalhes
                ) VALUES (
                    'DATABASE_TRIGGER',
                    NOW(),
                    'UPDATE',
                    'Institution',
                    NEW.id_instituicao,
                    jsonb_build_object(
                        'razaoSocial', OLD.razao_social,
                        'cnpj', OLD.cnpj,
                        'statusOSC', OLD.status_osc
                    )::TEXT,
                    jsonb_build_object(
                        'razaoSocial', NEW.razao_social,
                        'cnpj', NEW.cnpj,
                        'statusOSC', NEW.status_osc
                    )::TEXT,
                    'SUCESSO',
                    'Mudança crítica em instituição via SQL direto'
                );
            END IF;
        END IF;
        RETURN NEW;

    -- INSERT
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO logs_auditoria (
            origem,
            data_hora,
            acao,
            entidade,
            registro_id,
            valores_novos,
            resultado,
            detalhes
        ) VALUES (
            'DATABASE_TRIGGER',
            NOW(),
            'INSERT',
            'Institution',
            NEW.id_instituicao,
            jsonb_build_object(
                'razaoSocial', NEW.razao_social,
                'cnpj', NEW.cnpj,
                'statusOSC', NEW.status_osc
            )::TEXT,
            'SUCESSO',
            'Instituição criada via SQL direto (não pela aplicação)'
        );
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION audit_instituicoes_trigger() IS
'Trigger function para auditar mudanças diretas na tabela instituicoes';

-- =====================================================
-- 4. FUNCTION DE AUDIT PARA EMENDAS (APENAS DELETE)
-- =====================================================
CREATE OR REPLACE FUNCTION audit_emendas_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Apenas DELETE - proteção contra deleção acidental
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO logs_auditoria (
            origem,
            data_hora,
            acao,
            entidade,
            registro_id,
            valores_anteriores,
            resultado,
            detalhes
        ) VALUES (
            'DATABASE_TRIGGER',
            NOW(),
            'DELETE',
            'Emenda',
            OLD.id,
            jsonb_build_object(
                'id', OLD.id,
                'codigoOficial', OLD.codigo_oficial,
                'valor', OLD.valor,
                'status', OLD.status,
                'instituicaoId', OLD.id_instituicao,
                'parlamentarId', OLD.id_parlamentar
            )::TEXT,
            'SUCESSO',
            '⚠️ ALERTA: Emenda deletada via SQL direto (possível acidente!)'
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION audit_emendas_delete_trigger() IS
'Trigger function para auditar deleções diretas de emendas (proteção contra acidentes)';

-- =====================================================
-- 5. FUNCTION DE AUDIT PARA DOCUMENTOS (APENAS DELETE)
-- =====================================================
CREATE OR REPLACE FUNCTION audit_documentos_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Apenas DELETE - proteção contra deleção acidental
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO logs_auditoria (
            origem,
            data_hora,
            acao,
            entidade,
            registro_id,
            valores_anteriores,
            resultado,
            detalhes
        ) VALUES (
            'DATABASE_TRIGGER',
            NOW(),
            'DELETE',
            'DocumentoInstitucional',
            OLD.id,
            jsonb_build_object(
                'id', OLD.id,
                'tipoDocumento', OLD.tipo_documento,
                'nomeArquivo', OLD.nome_arquivo,
                'statusAprovacao', OLD.status_aprovacao,
                'instituicaoId', OLD.id_instituicao
            )::TEXT,
            'SUCESSO',
            '⚠️ ALERTA: Documento deletado via SQL direto (possível acidente!)'
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION audit_documentos_delete_trigger() IS
'Trigger function para auditar deleções diretas de documentos (proteção contra acidentes)';

-- =====================================================
-- 6. CRIAR TRIGGERS NAS TABELAS
-- =====================================================

-- USUARIOS: Audita INSERT, UPDATE, DELETE
DROP TRIGGER IF EXISTS usuarios_audit_trigger ON usuarios;
CREATE TRIGGER usuarios_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON usuarios
FOR EACH ROW EXECUTE FUNCTION audit_usuarios_trigger();

COMMENT ON TRIGGER usuarios_audit_trigger ON usuarios IS
'Audita todas as operações diretas (SQL) na tabela usuarios';

-- INSTITUIÇÕES: Audita INSERT, UPDATE, DELETE
DROP TRIGGER IF EXISTS instituicoes_audit_trigger ON instituicoes;
CREATE TRIGGER instituicoes_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON instituicoes
FOR EACH ROW EXECUTE FUNCTION audit_instituicoes_trigger();

COMMENT ON TRIGGER instituicoes_audit_trigger ON instituicoes IS
'Audita todas as operações diretas (SQL) na tabela instituicoes';

-- EMENDAS: Audita APENAS DELETE (proteção)
DROP TRIGGER IF EXISTS emendas_delete_audit_trigger ON emendas;
CREATE TRIGGER emendas_delete_audit_trigger
AFTER DELETE ON emendas
FOR EACH ROW EXECUTE FUNCTION audit_emendas_delete_trigger();

COMMENT ON TRIGGER emendas_delete_audit_trigger ON emendas IS
'Audita deleções diretas de emendas (proteção contra acidentes)';

-- DOCUMENTOS: Audita APENAS DELETE (proteção)
DROP TRIGGER IF EXISTS documentos_delete_audit_trigger ON documentos_institucionais;
CREATE TRIGGER documentos_delete_audit_trigger
AFTER DELETE ON documentos_institucionais
FOR EACH ROW EXECUTE FUNCTION audit_documentos_delete_trigger();

COMMENT ON TRIGGER documentos_delete_audit_trigger ON documentos_institucionais IS
'Audita deleções diretas de documentos (proteção contra acidentes)';

-- =====================================================
-- 7. VIEWS ÚTEIS PARA ANÁLISE DE AUDIT
-- =====================================================

-- View: Logs por origem (comparar Application vs Trigger)
CREATE OR REPLACE VIEW v_audit_por_origem AS
SELECT
    origem,
    entidade,
    acao,
    COUNT(*) as total,
    MIN(data_hora) as primeiro_log,
    MAX(data_hora) as ultimo_log
FROM logs_auditoria
GROUP BY origem, entidade, acao
ORDER BY total DESC;

COMMENT ON VIEW v_audit_por_origem IS
'Estatísticas de logs de auditoria por origem e tipo de operação';

-- View: Logs suspeitos (operações diretas no banco)
CREATE OR REPLACE VIEW v_audit_operacoes_diretas AS
SELECT
    data_hora,
    acao,
    entidade,
    registro_id,
    usuario_nome,
    detalhes,
    valores_anteriores,
    valores_novos
FROM logs_auditoria
WHERE origem = 'DATABASE_TRIGGER'
ORDER BY data_hora DESC;

COMMENT ON VIEW v_audit_operacoes_diretas IS
'Lista operações feitas diretamente no banco (fora da aplicação)';

-- View: Alertas de deleção
CREATE OR REPLACE VIEW v_audit_alertas_delecao AS
SELECT
    data_hora,
    entidade,
    registro_id,
    valores_anteriores,
    detalhes
FROM logs_auditoria
WHERE acao = 'DELETE'
  AND origem = 'DATABASE_TRIGGER'
ORDER BY data_hora DESC;

COMMENT ON VIEW v_audit_alertas_delecao IS
'Alertas de deleções feitas fora da aplicação (possíveis acidentes)';

-- =====================================================
-- 8. FUNÇÃO HELPER PARA DESABILITAR TRIGGERS TEMPORARIAMENTE
-- =====================================================
-- Útil quando fazer bulk imports ou manutenções

CREATE OR REPLACE FUNCTION disable_audit_triggers()
RETURNS void AS $$
BEGIN
    ALTER TABLE usuarios DISABLE TRIGGER usuarios_audit_trigger;
    ALTER TABLE instituicoes DISABLE TRIGGER instituicoes_audit_trigger;
    ALTER TABLE emendas DISABLE TRIGGER emendas_delete_audit_trigger;
    ALTER TABLE documentos_institucionais DISABLE TRIGGER documentos_delete_audit_trigger;

    RAISE NOTICE '⚠️ AUDIT TRIGGERS DESABILITADOS! Lembre-se de reativar após manutenção.';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION disable_audit_triggers() IS
'Desabilita todos os triggers de auditoria (usar apenas durante manutenção)';

CREATE OR REPLACE FUNCTION enable_audit_triggers()
RETURNS void AS $$
BEGIN
    ALTER TABLE usuarios ENABLE TRIGGER usuarios_audit_trigger;
    ALTER TABLE instituicoes ENABLE TRIGGER instituicoes_audit_trigger;
    ALTER TABLE emendas ENABLE TRIGGER emendas_delete_audit_trigger;
    ALTER TABLE documentos_institucionais ENABLE TRIGGER documentos_delete_audit_trigger;

    RAISE NOTICE '✅ AUDIT TRIGGERS REATIVADOS!';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION enable_audit_triggers() IS
'Reativa todos os triggers de auditoria após manutenção';

-- =====================================================
-- 9. TESTES DE VALIDAÇÃO
-- =====================================================

-- Inserir comentário explicativo
COMMENT ON COLUMN logs_auditoria.origem IS
'Origem do log:
- APPLICATION: Log gerado pela aplicação Java (contexto completo)
- DATABASE_TRIGGER: Log gerado por trigger (operação SQL direta)
Triggers são backup de segurança para operações não controladas pela aplicação.';

-- =====================================================
-- FIM DA MIGRATION V19
-- =====================================================
-- Próximos passos:
-- 1. Testar triggers: fazer INSERT/UPDATE/DELETE direto
-- 2. Verificar logs em logs_auditoria com origem = 'DATABASE_TRIGGER'
-- 3. Usar views v_audit_* para monitoramento
-- =====================================================
