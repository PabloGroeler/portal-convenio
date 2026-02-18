-- V25: EMERGÊNCIA - Desabilitar trigger com erro e recriar corretamente
-- Esta migration corrige o problema IMEDIATAMENTE sem precisar de intervenção manual

-- PASSO 1: Dropar triggers (IF EXISTS funciona aqui)
DROP TRIGGER IF EXISTS trg_audit_usuarios ON usuarios;
DROP TRIGGER IF EXISTS usuarios_audit_trigger ON usuarios;

-- PASSO 2: Dropar function com CASCADE
DROP FUNCTION IF EXISTS audit_usuarios_trigger() CASCADE;

-- PASSO 3: Recriar function COM OS NOMES CORRETOS (perfil, status)
CREATE OR REPLACE FUNCTION audit_usuarios_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_nome VARCHAR(255);
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_usuario_nome := OLD.nome_usuario;
    ELSE
        v_usuario_nome := NEW.nome_usuario;
    END IF;

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO logs_auditoria (
            origem, data_hora, acao, entidade, registro_id,
            usuario_id, usuario_nome, valores_anteriores, resultado, detalhes
        ) VALUES (
            'DATABASE_TRIGGER', NOW(), 'DELETE', 'Usuario', OLD.id::TEXT,
            OLD.id, OLD.nome_usuario,
            jsonb_build_object(
                'id', OLD.id, 'username', OLD.nome_usuario, 'email', OLD.email,
                'perfil', OLD.perfil, 'status', OLD.status,
                'cpf', '***MASKED***', 'cnpj', '***MASKED***'
            )::TEXT,
            'SUCESSO', 'Registro deletado via SQL direto'
        );
        RETURN OLD;

    ELSIF (TG_OP = 'UPDATE') THEN
        IF row(OLD.*) IS DISTINCT FROM row(NEW.*) THEN
            -- CORRIGIDO: Usando OLD.perfil ao invés de OLD.role
            IF OLD.perfil IS DISTINCT FROM NEW.perfil
               OR OLD.status IS DISTINCT FROM NEW.status THEN
                INSERT INTO logs_auditoria (
                    origem, data_hora, acao, entidade, registro_id,
                    usuario_id, usuario_nome, valores_anteriores, valores_novos, resultado, detalhes
                ) VALUES (
                    'DATABASE_TRIGGER', NOW(), 'UPDATE', 'Usuario', NEW.id::TEXT,
                    NEW.id, NEW.nome_usuario,
                    jsonb_build_object('perfil', OLD.perfil, 'status', OLD.status)::TEXT,
                    jsonb_build_object('perfil', NEW.perfil, 'status', NEW.status)::TEXT,
                    'SUCESSO', 'Mudança crítica: perfil ou status alterado'
                );
            END IF;
        END IF;
        RETURN NEW;

    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO logs_auditoria (
            origem, data_hora, acao, entidade, registro_id,
            usuario_id, usuario_nome, valores_novos, resultado, detalhes
        ) VALUES (
            'DATABASE_TRIGGER', NOW(), 'INSERT', 'Usuario', NEW.id::TEXT,
            NEW.id, NEW.nome_usuario,
            jsonb_build_object(
                'id', NEW.id, 'username', NEW.nome_usuario, 'email', NEW.email,
                'perfil', NEW.perfil, 'status', NEW.status
            )::TEXT,
            'SUCESSO', 'Registro criado via SQL direto'
        );
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- PASSO 4: Recriar trigger
CREATE TRIGGER trg_audit_usuarios
AFTER INSERT OR UPDATE OR DELETE ON usuarios
FOR EACH ROW EXECUTE FUNCTION audit_usuarios_trigger();

-- PASSO 5: Comentário
COMMENT ON FUNCTION audit_usuarios_trigger() IS
'Trigger de auditoria para usuarios - CORRIGIDA: usa perfil e status (nomes reais das colunas)';
