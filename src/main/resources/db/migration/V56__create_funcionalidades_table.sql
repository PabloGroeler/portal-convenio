-- Create table for funcionalidades configuration
CREATE TABLE funcionalidades (
    id BIGSERIAL PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    percentual_saude NUMERIC(8,2) DEFAULT 0,
    percentual_educacao NUMERIC(8,2) DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

