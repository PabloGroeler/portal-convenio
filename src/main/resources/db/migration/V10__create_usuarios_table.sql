-- Flyway migration: create usuarios table for user management
CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nome_completo VARCHAR(200) NOT NULL,
  cpf VARCHAR(11) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefone VARCHAR(30),
  cargo_funcao VARCHAR(120),
  status VARCHAR(20) NOT NULL,
  role VARCHAR(30) NOT NULL,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  create_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  update_time TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Uniqueness rules
CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_cpf ON usuarios (cpf);
CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_email ON usuarios (email);
CREATE UNIQUE INDEX IF NOT EXISTS ux_usuarios_username ON usuarios (username);

CREATE INDEX IF NOT EXISTS idx_usuarios_status ON usuarios (status);

