-- Script para corrigir problema de checksum do Flyway
-- Execute este script ANTES de rodar docker-compose up

-- Conectar ao banco de dados
-- docker exec -it <container-postgres> psql -U <usuario> -d app_emendas

-- Ver o histórico do Flyway
SELECT installed_rank, version, description, type, script, checksum, installed_on, success
FROM flyway_schema_history
WHERE version = '7';

-- Se a migration V7 existir, deletar do histórico
DELETE FROM flyway_schema_history WHERE version = '7';

-- Verificar se foi deletada
SELECT * FROM flyway_schema_history WHERE version = '7';

-- Agora pode sair e rodar: docker-compose up --build

