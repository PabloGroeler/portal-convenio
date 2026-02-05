-- Script para verificar se vínculos estão sendo criados
-- Execute este script após criar uma instituição pelo frontend

-- 1. Ver todos os vínculos (incluindo inativos)
SELECT
    ui.id,
    ui.usuario_id,
    ui.instituicao_id,
    ui.data_vinculo,
    ui.ativo,
    u.nome_completo,
    u.nome_usuario,
    i.razao_social
FROM usuarios_instituicoes ui
LEFT JOIN usuarios u ON u.id = ui.usuario_id
LEFT JOIN instituicoes i ON i.id_instituicao = ui.instituicao_id
ORDER BY ui.id DESC
LIMIT 10;

-- 2. Contar vínculos por usuário
SELECT
    u.id,
    u.nome_completo,
    u.nome_usuario,
    COUNT(ui.id) as total_vinculos
FROM usuarios u
LEFT JOIN usuarios_instituicoes ui ON ui.usuario_id = u.id AND ui.ativo = true
GROUP BY u.id, u.nome_completo, u.nome_usuario
ORDER BY u.id;

-- 3. Ver últimas instituições criadas
SELECT
    id_instituicao,
    razao_social,
    email_institucional,
    data_criacao
FROM instituicoes
ORDER BY data_criacao DESC
LIMIT 5;

-- 4. Ver usuários cadastrados
SELECT
    id,
    nome_usuario,
    nome_completo,
    email,
    data_criacao
FROM usuarios
ORDER BY id;

-- 5. Verificar estrutura da tabela usuarios_instituicoes
\d usuarios_instituicoes

-- 6. Tentar inserir manualmente (TESTE)
-- Ajuste os IDs conforme necessário
-- INSERT INTO usuarios_instituicoes (usuario_id, instituicao_id, data_vinculo, ativo)
-- VALUES (1, 'algum-id-instituicao', NOW(), true);
-- SELECT * FROM usuarios_instituicoes WHERE usuario_id = 1;

-- 7. Verificar constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'usuarios_instituicoes';

