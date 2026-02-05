-- Script para limpar histórico do Flyway e permitir re-execução das migrations
-- Execute este script se precisar reiniciar as migrations do zero

-- ATENÇÃO: Isso vai apagar todos os dados!
-- Use apenas em desenvolvimento

-- Deletar tabela de histórico do Flyway
DROP TABLE IF EXISTS flyway_schema_history CASCADE;

-- Deletar todas as tabelas em ordem (respeitando foreign keys)
DROP TABLE IF EXISTS usuarios_instituicoes CASCADE;
DROP TABLE IF EXISTS historico_emendas CASCADE;
DROP TABLE IF EXISTS anexos_emendas CASCADE;
DROP TABLE IF EXISTS emendas CASCADE;
DROP TABLE IF EXISTS parlamentares CASCADE;
DROP TABLE IF EXISTS instituicoes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS tipos_emenda CASCADE;
DROP TABLE IF EXISTS secretarias_municipais CASCADE;

-- Limpar sequences
DROP SEQUENCE IF EXISTS usuarios_seq CASCADE;
DROP SEQUENCE IF EXISTS instituicoes_seq CASCADE;

-- Mensagem
SELECT 'Banco limpo! Execute a aplicação novamente para recriar as tabelas.' as status;

