-- Script para corrigir sequence da tabela usuarios_instituicoes
-- Execute este script se a tabela já existe mas a sequence está faltando

-- Criar sequence se não existir
CREATE SEQUENCE IF NOT EXISTS usuarios_instituicoes_seq START WITH 1 INCREMENT BY 1;

-- Se a tabela já tem registros, ajustar o valor inicial da sequence
SELECT setval('usuarios_instituicoes_seq', COALESCE((SELECT MAX(id) FROM usuarios_instituicoes), 0) + 1, false);

-- Vincular sequence à coluna id
ALTER SEQUENCE usuarios_instituicoes_seq OWNED BY usuarios_instituicoes.id;

-- Definir default value para a coluna id
ALTER TABLE usuarios_instituicoes ALTER COLUMN id SET DEFAULT nextval('usuarios_instituicoes_seq');

-- Verificar se funcionou
SELECT
    schemaname,
    sequencename,
    last_value,
    start_value,
    increment_by
FROM pg_sequences
WHERE sequencename = 'usuarios_instituicoes_seq';

-- Testar inserção (OPCIONAL - descomente para testar)
-- INSERT INTO usuarios_instituicoes (usuario_id, instituicao_id, data_vinculo, ativo)
-- VALUES (1, 'test-seq-123', NOW(), true);
-- SELECT * FROM usuarios_instituicoes WHERE instituicao_id = 'test-seq-123';

