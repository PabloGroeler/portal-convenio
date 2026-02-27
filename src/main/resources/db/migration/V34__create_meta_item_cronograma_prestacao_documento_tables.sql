-- Migration to create metas, itens, cronogramas, prestacao_contas and documentos tables
CREATE TABLE IF NOT EXISTS metas (
  id TEXT PRIMARY KEY,
  plano_trabalho_id TEXT NOT NULL,
  titulo VARCHAR(200),
  descricao TEXT,
  valor NUMERIC(18,2),
  create_time TIMESTAMP WITH TIME ZONE,
  update_time TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS itens (
  id TEXT PRIMARY KEY,
  meta_id TEXT NOT NULL,
  titulo VARCHAR(200),
  descricao TEXT,
  valor NUMERIC(18,2),
  create_time TIMESTAMP WITH TIME ZONE,
  update_time TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS cronogramas (
  id TEXT PRIMARY KEY,
  meta_id TEXT NOT NULL,
  data_prevista DATE,
  atividade TEXT,
  create_time TIMESTAMP WITH TIME ZONE,
  update_time TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS prestacao_contas (
  id TEXT PRIMARY KEY,
  plano_trabalho_id TEXT NOT NULL,
  valor_executado NUMERIC(18,2),
  observacoes TEXT,
  create_time TIMESTAMP WITH TIME ZONE,
  update_time TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS documentos (
  id TEXT PRIMARY KEY,
  entidade_tipo VARCHAR(50), -- e.g., 'plano_trabalho','meta','item','instituicao'
  entidade_id TEXT,
  tipo_documento VARCHAR(100),
  filename VARCHAR(255),
  url TEXT,
  create_time TIMESTAMP WITH TIME ZONE
);
