-- V58: Solução definitiva para desincronização de sequences
--
-- CAUSA RAIZ: A coluna `id` de `usuarios` pode ter sido criada como SERIAL
-- (gerando `usuarios_id_seq`) enquanto o Hibernate usa `usuarios_seq`.
-- Inserts manuais/seeds avançam uma sequence, Hibernate avança outra → colisão.
--
-- SOLUÇÃO: Criar `usuarios_seq` se não existir, definir como DEFAULT da coluna,
-- sincronizar com MAX(id) atual, e repetir para todas as tabelas com sequences
-- nomeadas pelo Hibernate.

DO $$
DECLARE
    v_max BIGINT;
BEGIN

    -- ═══════════════════════════════════════════════════════════════════
    -- USUARIOS → usuarios_seq
    -- ═══════════════════════════════════════════════════════════════════
    -- 1) Criar a sequence se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'usuarios_seq') THEN
        CREATE SEQUENCE public.usuarios_seq INCREMENT BY 1 START WITH 1 NO MINVALUE NO MAXVALUE CACHE 1;
        RAISE NOTICE 'Criada sequence usuarios_seq';
    END IF;

    -- 2) Vincular como DEFAULT da coluna (idempotente)
    ALTER TABLE usuarios ALTER COLUMN id SET DEFAULT nextval('usuarios_seq');
    ALTER SEQUENCE usuarios_seq OWNED BY usuarios.id;

    -- 3) Sincronizar com MAX(id) atual
    SELECT COALESCE(MAX(id), 0) + 1 INTO v_max FROM usuarios;
    PERFORM setval('usuarios_seq', GREATEST(v_max, 1), false);
    RAISE NOTICE 'usuarios_seq → %', GREATEST(v_max, 1);

    -- ═══════════════════════════════════════════════════════════════════
    -- USUARIOS_INSTITUICOES → usuarios_instituicoes_id_seq
    -- ═══════════════════════════════════════════════════════════════════
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'usuarios_instituicoes_id_seq') THEN
        CREATE SEQUENCE public.usuarios_instituicoes_id_seq INCREMENT BY 1 START WITH 1 NO MINVALUE NO MAXVALUE CACHE 1;
    END IF;
    ALTER TABLE usuarios_instituicoes ALTER COLUMN id SET DEFAULT nextval('usuarios_instituicoes_id_seq');
    ALTER SEQUENCE usuarios_instituicoes_id_seq OWNED BY usuarios_instituicoes.id;
    SELECT COALESCE(MAX(id), 0) + 1 INTO v_max FROM usuarios_instituicoes;
    PERFORM setval('usuarios_instituicoes_id_seq', GREATEST(v_max, 1), false);
    RAISE NOTICE 'usuarios_instituicoes_id_seq → %', GREATEST(v_max, 1);

    -- ═══════════════════════════════════════════════════════════════════
    -- LOGS_AUDITORIA → logs_auditoria_id_seq
    -- ═══════════════════════════════════════════════════════════════════
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'logs_auditoria_id_seq') THEN
        CREATE SEQUENCE public.logs_auditoria_id_seq INCREMENT BY 1 START WITH 1 NO MINVALUE NO MAXVALUE CACHE 1;
    END IF;
    ALTER TABLE logs_auditoria ALTER COLUMN id SET DEFAULT nextval('logs_auditoria_id_seq');
    ALTER SEQUENCE logs_auditoria_id_seq OWNED BY logs_auditoria.id;
    SELECT COALESCE(MAX(id), 0) + 1 INTO v_max FROM logs_auditoria;
    PERFORM setval('logs_auditoria_id_seq', GREATEST(v_max, 1), false);
    RAISE NOTICE 'logs_auditoria_id_seq → %', GREATEST(v_max, 1);

    -- ═══════════════════════════════════════════════════════════════════
    -- EMENDAS_HISTORICO → emendas_historico_seq
    -- ═══════════════════════════════════════════════════════════════════
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'emendas_historico_seq') THEN
        CREATE SEQUENCE public.emendas_historico_seq INCREMENT BY 1 START WITH 1 NO MINVALUE NO MAXVALUE CACHE 1;
    END IF;
    ALTER TABLE emendas_historico ALTER COLUMN id SET DEFAULT nextval('emendas_historico_seq');
    ALTER SEQUENCE emendas_historico_seq OWNED BY emendas_historico.id;
    SELECT COALESCE(MAX(id), 0) + 1 INTO v_max FROM emendas_historico;
    PERFORM setval('emendas_historico_seq', GREATEST(v_max, 1), false);
    RAISE NOTICE 'emendas_historico_seq → %', GREATEST(v_max, 1);

    -- ═══════════════════════════════════════════════════════════════════
    -- EMENDA_ADMISSIBILIDADE → emenda_admissibilidade_id_seq
    -- ═══════════════════════════════════════════════════════════════════
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'emenda_admissibilidade_id_seq') THEN
        CREATE SEQUENCE public.emenda_admissibilidade_id_seq INCREMENT BY 1 START WITH 1 NO MINVALUE NO MAXVALUE CACHE 1;
    END IF;
    ALTER TABLE emenda_admissibilidade ALTER COLUMN id SET DEFAULT nextval('emenda_admissibilidade_id_seq');
    ALTER SEQUENCE emenda_admissibilidade_id_seq OWNED BY emenda_admissibilidade.id;
    SELECT COALESCE(MAX(id), 0) + 1 INTO v_max FROM emenda_admissibilidade;
    PERFORM setval('emenda_admissibilidade_id_seq', GREATEST(v_max, 1), false);
    RAISE NOTICE 'emenda_admissibilidade_id_seq → %', GREATEST(v_max, 1);

    -- ═══════════════════════════════════════════════════════════════════
    -- EMENDA_ANALISTA_ORCAMENTO → emenda_analista_orcamento_id_seq
    -- ═══════════════════════════════════════════════════════════════════
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'emenda_analista_orcamento_id_seq') THEN
        CREATE SEQUENCE public.emenda_analista_orcamento_id_seq INCREMENT BY 1 START WITH 1 NO MINVALUE NO MAXVALUE CACHE 1;
    END IF;
    ALTER TABLE emenda_analista_orcamento ALTER COLUMN id SET DEFAULT nextval('emenda_analista_orcamento_id_seq');
    ALTER SEQUENCE emenda_analista_orcamento_id_seq OWNED BY emenda_analista_orcamento.id;
    SELECT COALESCE(MAX(id), 0) + 1 INTO v_max FROM emenda_analista_orcamento;
    PERFORM setval('emenda_analista_orcamento_id_seq', GREATEST(v_max, 1), false);
    RAISE NOTICE 'emenda_analista_orcamento_id_seq → %', GREATEST(v_max, 1);

    -- ═══════════════════════════════════════════════════════════════════
    -- FUNCOES_ORCAMENTARIAS → funcoes_orcamentarias_id_seq
    -- ═══════════════════════════════════════════════════════════════════
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'funcoes_orcamentarias_id_seq') THEN
        CREATE SEQUENCE public.funcoes_orcamentarias_id_seq INCREMENT BY 1 START WITH 1 NO MINVALUE NO MAXVALUE CACHE 1;
    END IF;
    ALTER TABLE funcoes_orcamentarias ALTER COLUMN id SET DEFAULT nextval('funcoes_orcamentarias_id_seq');
    ALTER SEQUENCE funcoes_orcamentarias_id_seq OWNED BY funcoes_orcamentarias.id;
    SELECT COALESCE(MAX(id), 0) + 1 INTO v_max FROM funcoes_orcamentarias;
    PERFORM setval('funcoes_orcamentarias_id_seq', GREATEST(v_max, 1), false);
    RAISE NOTICE 'funcoes_orcamentarias_id_seq → %', GREATEST(v_max, 1);

    -- ═══════════════════════════════════════════════════════════════════
    -- SECRETARIAS_MUNICIPAIS → secretarias_municipais_seq
    -- ═══════════════════════════════════════════════════════════════════
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'secretarias_municipais_seq') THEN
        CREATE SEQUENCE public.secretarias_municipais_seq INCREMENT BY 1 START WITH 1 NO MINVALUE NO MAXVALUE CACHE 1;
    END IF;
    ALTER TABLE secretarias_municipais ALTER COLUMN id SET DEFAULT nextval('secretarias_municipais_seq');
    ALTER SEQUENCE secretarias_municipais_seq OWNED BY secretarias_municipais.id;
    SELECT COALESCE(MAX(id), 0) + 1 INTO v_max FROM secretarias_municipais;
    PERFORM setval('secretarias_municipais_seq', GREATEST(v_max, 1), false);
    RAISE NOTICE 'secretarias_municipais_seq → %', GREATEST(v_max, 1);

END $$;
