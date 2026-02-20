-- Migration: Fix audit triggers - correct column names
-- Date: 2026-02-19
-- Description: Remove triggers antigas com nomes de colunas errados e recria corretamente

-- Drop triggers existentes que podem estar com problema
DROP TRIGGER IF EXISTS usuarios_audit_trigger ON usuarios CASCADE;
DROP FUNCTION IF EXISTS audit_usuarios_trigger() CASCADE;

-- Recriar função de auditoria com nomes corretos
CREATE OR REPLACE FUNCTION audit_usuarios_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_valores_antigos JSONB;
  v_valores_novos JSONB;
  v_campos_alterados TEXT[];
  v_acao TEXT;
  v_usuario TEXT;
BEGIN
  -- Determinar ação
  IF TG_OP = 'DELETE' THEN
    v_acao := 'DELETE';
    v_valores_antigos := to_jsonb(OLD);
    v_valores_novos := NULL;
    v_usuario := 'system';
  ELSIF TG_OP = 'INSERT' THEN
    v_acao := 'INSERT';
    v_valores_antigos := NULL;
    v_valores_novos := to_jsonb(NEW);
    v_usuario := NEW.nome_usuario;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Apenas auditar mudanças em campos específicos
    v_campos_alterados := ARRAY[]::TEXT[];

    IF OLD.nome_completo IS DISTINCT FROM NEW.nome_completo THEN
      v_campos_alterados := array_append(v_campos_alterados, 'nome_completo');
    END IF;

    IF OLD.documento IS DISTINCT FROM NEW.documento THEN
      v_campos_alterados := array_append(v_campos_alterados, 'documento');
    END IF;

    IF OLD.email IS DISTINCT FROM NEW.email THEN
      v_campos_alterados := array_append(v_campos_alterados, 'email');
    END IF;

    IF OLD.perfil IS DISTINCT FROM NEW.perfil
       OR OLD.status IS DISTINCT FROM NEW.status THEN
      v_acao := 'UPDATE_CRITICAL';
      v_valores_antigos := jsonb_build_object(
        'perfil', OLD.perfil,
        'status', OLD.status
      );
      v_valores_novos := jsonb_build_object(
        'perfil', NEW.perfil,
        'status', NEW.status
      );
      v_usuario := NEW.nome_usuario;
      v_campos_alterados := array_append(v_campos_alterados, 'perfil_ou_status');
    ELSIF array_length(v_campos_alterados, 1) > 0 THEN
      v_acao := 'UPDATE';
      v_valores_antigos := to_jsonb(OLD);
      v_valores_novos := to_jsonb(NEW);
      v_usuario := NEW.nome_usuario;
    ELSE
      RETURN NEW;
    END IF;
  END IF;

  -- Inserir log de auditoria com nomes de colunas corretos
  INSERT INTO logs_auditoria (
    entidade,
    registro_id,
    acao,
    valores_anteriores,
    valores_novos,
    detalhes,
    usuario_nome,
    origem,
    data_hora
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::TEXT,
    v_acao,
    v_valores_antigos::TEXT,
    v_valores_novos::TEXT,
    array_to_string(v_campos_alterados, ', '),
    v_usuario,
    'DATABASE_TRIGGER',
    NOW()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Recriar trigger
CREATE TRIGGER usuarios_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION audit_usuarios_trigger();
