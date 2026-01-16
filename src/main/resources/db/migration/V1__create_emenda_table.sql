-- Flyway migration: create emenda table
CREATE TABLE IF NOT EXISTS emenda (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  legal_name TEXT,
  cnpj VARCHAR(32),
  category TEXT,
  link TEXT,
  contact_email TEXT,
  contact_phone VARCHAR(50),
  create_time TIMESTAMPTZ,
  update_time TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_emenda_cnpj ON emenda(cnpj);

