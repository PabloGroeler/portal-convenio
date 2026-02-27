-- Migration to create plano_trabalho table
CREATE TABLE IF NOT EXISTS plano_trabalho (
    id TEXT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    instituicao_id VARCHAR(64),
    emenda_id VARCHAR(36),
    valor NUMERIC(18,2),
    status VARCHAR(50),
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE
);
