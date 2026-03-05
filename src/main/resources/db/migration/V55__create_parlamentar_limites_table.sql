-- Create table to store annual limits per parliamentarian
CREATE TABLE parlamentar_limites (
    id BIGSERIAL PRIMARY KEY,
    parlamentar_id VARCHAR(100) NOT NULL,
    ano INTEGER NOT NULL,
    valor_anual NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_parlamentar FOREIGN KEY (parlamentar_id) REFERENCES parlamentares(id_parlamentar) ON DELETE CASCADE
);

CREATE UNIQUE INDEX ux_parlamentar_ano ON parlamentar_limites (parlamentar_id, ano);
