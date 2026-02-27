-- Create historico table for plano_trabalho
CREATE TABLE IF NOT EXISTS plano_trabalho_historico (
    id TEXT PRIMARY KEY,
    plano_trabalho_id TEXT NOT NULL,
    acao VARCHAR(32) NOT NULL,
    motivo TEXT,
    usuario VARCHAR(128),
    data_hora TIMESTAMP WITH TIME ZONE
);
