-- Initial schema creation for Portal de Convênios system
-- Creates all base tables

-- Sequence for usuarios (Panache uses explicit sequences)
CREATE SEQUENCE IF NOT EXISTS usuarios_seq START WITH 1 INCREMENT BY 1;

-- Table: usuarios (User entity)
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT PRIMARY KEY DEFAULT nextval('usuarios_seq'),
    nome_completo VARCHAR(200) NOT NULL,
    cpf VARCHAR(11) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(30),
    cargo_funcao VARCHAR(120),
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
    perfil VARCHAR(30) NOT NULL DEFAULT 'OPERADOR',
    nome_usuario VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(nome_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_cpf ON usuarios(cpf);

-- Table: instituicoes (Institution entity)
CREATE TABLE IF NOT EXISTS instituicoes (
    id_instituicao VARCHAR(100) PRIMARY KEY,
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200),
    cnpj VARCHAR(14),
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    data_fundacao DATE,
    telefone VARCHAR(20),
    celular VARCHAR(20),
    email_institucional VARCHAR(200) UNIQUE,
    email_secundario VARCHAR(200),
    website VARCHAR(300),
    cep VARCHAR(8),
    logradouro VARCHAR(200),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(120),
    uf VARCHAR(2),
    ponto_referencia VARCHAR(200),
    numero_registro_conselho_municipal VARCHAR(50),
    data_registro_conselho DATE,
    objeto_social TEXT,
    quantidade_beneficiarios INTEGER,
    create_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    update_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_instituicoes_id_instituicao ON instituicoes(id_instituicao);
CREATE INDEX IF NOT EXISTS idx_instituicoes_cnpj ON instituicoes(cnpj);
CREATE INDEX IF NOT EXISTS idx_instituicoes_email ON instituicoes(email_institucional);

-- Table: instituicoes_areas_atuacao (ElementCollection for Institution)
CREATE TABLE IF NOT EXISTS instituicoes_areas_atuacao (
    institution_id VARCHAR(100) NOT NULL REFERENCES instituicoes(id_instituicao) ON DELETE CASCADE,
    area VARCHAR(100) NOT NULL
);

-- Table: parlamentares (Councilor entity)
CREATE TABLE IF NOT EXISTS parlamentares (
    id_parlamentar VARCHAR(100) PRIMARY KEY,
    nome_completo VARCHAR(200) NOT NULL,
    partido_politico VARCHAR(50),
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parlamentares_id ON parlamentares(id_parlamentar);

-- Table: tipos_emenda (TipoEmenda entity)
CREATE TABLE IF NOT EXISTS tipos_emenda (
    codigo VARCHAR(100) PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    ordem INTEGER,
    create_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    update_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Sequence for secretarias_municipais
CREATE SEQUENCE IF NOT EXISTS secretarias_municipais_seq START WITH 1 INCREMENT BY 1;

-- Table: secretarias_municipais (SecretariaMunicipal entity)
CREATE TABLE IF NOT EXISTS secretarias_municipais (
    id BIGINT PRIMARY KEY DEFAULT nextval('secretarias_municipais_seq'),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    create_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    update_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Table: emendas (Emenda entity)
CREATE TABLE IF NOT EXISTS emendas (
    id VARCHAR(36) PRIMARY KEY,
    numero_emenda INTEGER,
    exercicio INTEGER NOT NULL,
    councilor_id VARCHAR(100) REFERENCES parlamentares(id_parlamentar),
    official_code VARCHAR(100),
    date DATE,
    value NUMERIC(15, 2),
    classification VARCHAR(100),
    category VARCHAR(100),
    status VARCHAR(50),
    status_ciclo_vida VARCHAR(30) NOT NULL DEFAULT 'Recebido',
    federal_status VARCHAR(100),
    esfera VARCHAR(20),
    existe_convenio BOOLEAN NOT NULL DEFAULT false,
    numero_convenio VARCHAR(16),
    ano_convenio INTEGER,
    institution_id VARCHAR(100) REFERENCES instituicoes(id_instituicao),
    signed_link TEXT,
    descricao VARCHAR(1000),
    objeto_detalhado TEXT,
    previsao_conclusao DATE,
    justificativa VARCHAR(1000),
    data_criacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    data_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emendas_id ON emendas(id);
CREATE INDEX IF NOT EXISTS idx_emendas_parlamentar ON emendas(councilor_id);
CREATE INDEX IF NOT EXISTS idx_emendas_instituicao ON emendas(institution_id);
CREATE INDEX IF NOT EXISTS idx_emendas_status ON emendas(status);
CREATE INDEX IF NOT EXISTS idx_emendas_codigo_oficial ON emendas(official_code);

-- Table: emendas_anexos (ElementCollection for Emenda attachments)
CREATE TABLE IF NOT EXISTS emendas_anexos (
    emenda_id VARCHAR(36) NOT NULL REFERENCES emendas(id) ON DELETE CASCADE,
    url TEXT
);

-- Sequence for emendas_historico
CREATE SEQUENCE IF NOT EXISTS emendas_historico_seq START WITH 1 INCREMENT BY 1;

-- Table: emendas_historico (EmendaHistorico entity)
CREATE TABLE IF NOT EXISTS emendas_historico (
    id BIGINT PRIMARY KEY DEFAULT nextval('emendas_historico_seq'),
    emenda_id VARCHAR(36) NOT NULL REFERENCES emendas(id) ON DELETE CASCADE,
    acao VARCHAR(50) NOT NULL,
    status_anterior VARCHAR(50),
    status_novo VARCHAR(50),
    observacao TEXT,
    usuario VARCHAR(100),
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historico_emenda ON emendas_historico(emenda_id);
CREATE INDEX IF NOT EXISTS idx_historico_data ON emendas_historico(data_hora);

-- Table: news (News entity)
CREATE TABLE IF NOT EXISTS news (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    published_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    author VARCHAR(200),
    image_url VARCHAR(500),
    category VARCHAR(100),
    tags TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_published_date ON news(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);

COMMENT ON TABLE usuarios IS 'Usuários do sistema';
COMMENT ON TABLE instituicoes IS 'Instituições beneficiárias';
COMMENT ON TABLE parlamentares IS 'Parlamentares que propõem emendas';
COMMENT ON TABLE tipos_emenda IS 'Tipos de emendas parlamentares';
COMMENT ON TABLE secretarias_municipais IS 'Secretarias municipais responsáveis';
COMMENT ON TABLE emendas IS 'Emendas parlamentares';
COMMENT ON TABLE emendas_historico IS 'Histórico de alterações das emendas';
COMMENT ON TABLE news IS 'Notícias do portal';

