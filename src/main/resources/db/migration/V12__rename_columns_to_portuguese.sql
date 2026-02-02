-- V12: Rename all database columns to Portuguese across all tables

-- ===========================
-- EMENDAS TABLE
-- ===========================

-- Rename councilor_id to id_parlamentar
ALTER TABLE emendas RENAME COLUMN councilor_id TO id_parlamentar;

-- Rename official_code to codigo_oficial
ALTER TABLE emendas RENAME COLUMN official_code TO codigo_oficial;

-- Rename date to data
ALTER TABLE emendas RENAME COLUMN date TO data;

-- Rename value to valor
ALTER TABLE emendas RENAME COLUMN value TO valor;

-- Rename classification to classificacao
ALTER TABLE emendas RENAME COLUMN classification TO classificacao;

-- Rename category to categoria
ALTER TABLE emendas RENAME COLUMN category TO categoria;

-- Rename status to situacao
ALTER TABLE emendas RENAME COLUMN status TO situacao;

-- Rename federal_status to status_federal
ALTER TABLE emendas RENAME COLUMN federal_status TO status_federal;

-- Rename institution_id to id_instituicao
ALTER TABLE emendas RENAME COLUMN institution_id TO id_instituicao;

-- Rename signed_link to link_assinado
ALTER TABLE emendas RENAME COLUMN signed_link TO link_assinado;

-- Rename description to descricao
ALTER TABLE emendas RENAME COLUMN description TO descricao;

-- Rename object_detail to objeto_detalhado
ALTER TABLE emendas RENAME COLUMN object_detail TO objeto_detalhado;

-- Rename create_time to data_criacao
ALTER TABLE emendas RENAME COLUMN create_time TO data_criacao;

-- Rename update_time to data_atualizacao
ALTER TABLE emendas RENAME COLUMN update_time TO data_atualizacao;

-- Update index names to Portuguese
DROP INDEX IF EXISTS idx_emendas_vereador;
DROP INDEX IF EXISTS idx_emendas_councilor;
CREATE INDEX IF NOT EXISTS idx_emendas_parlamentar ON emendas(id_parlamentar);

DROP INDEX IF EXISTS idx_emendas_instituicao;
CREATE INDEX IF NOT EXISTS idx_emendas_instituicao ON emendas(id_instituicao);

DROP INDEX IF EXISTS idx_emendas_codigo_oficial;
CREATE INDEX IF NOT EXISTS idx_emendas_codigo_oficial ON emendas(codigo_oficial);

-- ===========================
-- INSTITUICOES TABLE
-- ===========================

-- Rename create_time to data_criacao
ALTER TABLE instituicoes RENAME COLUMN create_time TO data_criacao;

-- Rename update_time to data_atualizacao
ALTER TABLE instituicoes RENAME COLUMN update_time TO data_atualizacao;

-- ===========================
-- PARLAMENTARES TABLE
-- ===========================

-- Rename councilor_id to id_parlamentar
ALTER TABLE parlamentares RENAME COLUMN councilor_id TO id_parlamentar;

-- Rename full_name to nome_completo
ALTER TABLE parlamentares RENAME COLUMN full_name TO nome_completo;

-- Rename political_party to partido_politico
ALTER TABLE parlamentares RENAME COLUMN political_party TO partido_politico;

-- Rename create_time to data_criacao
ALTER TABLE parlamentares RENAME COLUMN create_time TO data_criacao;

-- Rename update_time to data_atualizacao
ALTER TABLE parlamentares RENAME COLUMN update_time TO data_atualizacao;

-- Update index names to Portuguese
DROP INDEX IF EXISTS idx_parlamentares_councilor_id;
CREATE INDEX IF NOT EXISTS idx_parlamentares_id ON parlamentares(id_parlamentar);

-- ===========================
-- USUARIOS TABLE
-- ===========================

-- Rename role to perfil
ALTER TABLE usuarios RENAME COLUMN role TO perfil;

-- Rename username to nome_usuario
ALTER TABLE usuarios RENAME COLUMN username TO nome_usuario;

-- Rename password to senha
ALTER TABLE usuarios RENAME COLUMN password TO senha;

-- Rename create_time to data_criacao
ALTER TABLE usuarios RENAME COLUMN create_time TO data_criacao;

-- Rename update_time to data_atualizacao
ALTER TABLE usuarios RENAME COLUMN update_time TO data_atualizacao;

-- ===========================
-- TIPOS_EMENDA TABLE
-- ===========================

-- Rename create_time to data_criacao
ALTER TABLE tipos_emenda RENAME COLUMN create_time TO data_criacao;

-- Rename update_time to data_atualizacao
ALTER TABLE tipos_emenda RENAME COLUMN update_time TO data_atualizacao;

-- ===========================
-- SECRETARIAS_MUNICIPAIS TABLE
-- ===========================

-- Rename create_time to data_criacao (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'secretarias_municipais'
        AND column_name = 'create_time'
    ) THEN
        ALTER TABLE secretarias_municipais RENAME COLUMN create_time TO data_criacao;
    END IF;
END $$;

-- Rename update_time to data_atualizacao (if exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'secretarias_municipais'
        AND column_name = 'update_time'
    ) THEN
        ALTER TABLE secretarias_municipais RENAME COLUMN update_time TO data_atualizacao;
    END IF;
END $$;


