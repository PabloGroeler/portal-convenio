-- V24: Corrigir nomes de colunas na trigger de auditoria de usuários
-- Data: 2026-02-18
-- Problema: Trigger usando nomes antigos (perfil, status_usuario) ao invés dos corretos (role, status)

-- Dropar a trigger primeiro (deve vir antes da function)
DROP TRIGGER IF EXISTS trg_audit_usuarios ON usuarios;

-- Dropar triggers alternativas que podem existir
DROP TRIGGER IF EXISTS usuarios_audit_trigger ON usuarios;

-- Agora dropar a function com CASCADE para remover qualquer dependência restante
DROP FUNCTION IF EXISTS audit_usuarios_trigger() CASCADE;

-- Recriar a function com os nomes de colunas corretos
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
                'role', OLD.role,
                'status', OLD.status,
                'cpf', '***MASKED***',
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
            IF OLD.role IS DISTINCT FROM NEW.role
               OR OLD.status IS DISTINCT FROM NEW.status THEN
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
                        'role', OLD.role,
                        'status', OLD.status
                    )::TEXT,
                    jsonb_build_object(
                        'role', NEW.role,
                        'status', NEW.status
                    )::TEXT,
                    'SUCESSO',
                    'Mudança crítica via SQL direto: role ou status alterado'
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
                'id', NEW.id,
                'username', NEW.nome_usuario,
                'email', NEW.email,
                'role', NEW.role,
                'status', NEW.status
            )::TEXT,
            'SUCESSO',
            'Registro criado via SQL direto (não pela aplicação)'
        );
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recriar a trigger
CREATE TRIGGER trg_audit_usuarios
AFTER INSERT OR UPDATE OR DELETE ON usuarios
FOR EACH ROW EXECUTE FUNCTION audit_usuarios_trigger();

-- Comentário explicativo
COMMENT ON FUNCTION audit_usuarios_trigger() IS
'Trigger de auditoria para tabela usuarios - registra mudanças críticas (perfil, status) e todas as operações diretas no banco';
