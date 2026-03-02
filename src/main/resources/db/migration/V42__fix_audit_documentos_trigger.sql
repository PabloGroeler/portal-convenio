-- V42: Fix audit trigger for documentos_institucionais
-- The old trigger referenced OLD.status_aprovacao which does not exist.
-- The correct column name is status_documento.

DROP TRIGGER IF EXISTS audit_documentos_delete ON documentos_institucionais CASCADE;
DROP FUNCTION IF EXISTS audit_documentos_delete_trigger() CASCADE;

CREATE OR REPLACE FUNCTION audit_documentos_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
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
            'id',              OLD.id,
            'tipoDocumento',   OLD.tipo_documento,
            'nomeArquivo',     OLD.nome_arquivo,
            'statusDocumento', OLD.status_documento,
            'instituicaoId',   OLD.id_instituicao
        )::TEXT,
        'SUCESSO',
        '⚠️ ALERTA: Documento deletado via SQL direto (possível acidente!)'
    );
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_documentos_delete
    AFTER DELETE ON documentos_institucionais
    FOR EACH ROW
    EXECUTE FUNCTION audit_documentos_delete_trigger();

