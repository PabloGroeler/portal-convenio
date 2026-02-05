-- Adicionar sequence para usuarios_instituicoes (correção)
-- A tabela foi criada com BIGSERIAL mas o Hibernate espera uma sequence específica

-- Verificar se a sequence gerada automaticamente existe e removê-la se necessário
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'usuarios_instituicoes_id_seq') THEN
        DROP SEQUENCE usuarios_instituicoes_id_seq CASCADE;
    END IF;
END $$;

-- Criar sequence com o nome correto esperado pelo Hibernate
CREATE SEQUENCE IF NOT EXISTS usuarios_instituicoes_seq START WITH 1 INCREMENT BY 1;

-- Se a tabela já tem registros, ajustar o valor inicial da sequence
SELECT setval('usuarios_instituicoes_seq', COALESCE((SELECT MAX(id) FROM usuarios_instituicoes), 0) + 1, false);

-- Vincular sequence à coluna id
ALTER SEQUENCE usuarios_instituicoes_seq OWNED BY usuarios_instituicoes.id;

-- Definir default value para a coluna id
ALTER TABLE usuarios_instituicoes ALTER COLUMN id SET DEFAULT nextval('usuarios_instituicoes_seq');

