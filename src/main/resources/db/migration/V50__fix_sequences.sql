-- Fix sequence drift on all tables that use serial/bigserial IDs

DO $$
DECLARE
    max_ui    BIGINT;
    max_audit BIGINT;
    max_usr   BIGINT;
    max_all   BIGINT;
    seq_name  TEXT;
BEGIN
    SELECT COALESCE(MAX(id), 0) INTO max_ui    FROM usuarios_instituicoes;
    SELECT COALESCE(MAX(id), 0) INTO max_audit FROM logs_auditoria;
    SELECT COALESCE(MAX(id), 0) INTO max_usr   FROM usuarios;

    max_all := GREATEST(max_ui, max_audit, max_usr) + 100;

    -- Reset hibernate_sequence if it exists
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'hibernate_sequence') THEN
        PERFORM setval('hibernate_sequence', max_all, false);
    END IF;

    -- Reset usuarios_instituicoes sequence
    seq_name := pg_get_serial_sequence('usuarios_instituicoes', 'id');
    IF seq_name IS NOT NULL THEN
        PERFORM setval(seq_name, GREATEST(max_ui, 1), false);
    END IF;

    -- Reset logs_auditoria sequence
    seq_name := pg_get_serial_sequence('logs_auditoria', 'id');
    IF seq_name IS NOT NULL THEN
        PERFORM setval(seq_name, GREATEST(max_audit, 1), false);
    END IF;

    -- Reset usuarios sequence
    seq_name := pg_get_serial_sequence('usuarios', 'id');
    IF seq_name IS NOT NULL THEN
        PERFORM setval(seq_name, GREATEST(max_usr, 1), false);
    END IF;
END $$;

