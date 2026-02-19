-- V26: Consolidar CPF e CNPJ em um único campo "documento"

-- Adicionar coluna documento
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS documento VARCHAR(14);

-- Migrar dados existentes: priorizar CPF, se não existir usar CNPJ
UPDATE usuarios SET documento = COALESCE(cpf, cnpj) WHERE documento IS NULL;

-- Criar índice único para documento
CREATE UNIQUE INDEX IF NOT EXISTS usuarios_documento_idx ON usuarios(documento) WHERE documento IS NOT NULL;

-- Remover as colunas antigas cpf e cnpj (apenas após migração completa)
-- ALTER TABLE usuarios DROP COLUMN IF EXISTS cpf;
-- ALTER TABLE usuarios DROP COLUMN IF EXISTS cnpj;

-- Comentário: As colunas cpf e cnpj serão removidas em uma migração futura após validação
