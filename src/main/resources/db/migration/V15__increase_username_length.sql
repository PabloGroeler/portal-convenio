-- V15: Increase username field length from 50 to 256 characters
-- This allows longer usernames for better flexibility in user registration

ALTER TABLE usuarios ALTER COLUMN nome_usuario TYPE VARCHAR(256);

-- Add comment
COMMENT ON COLUMN usuarios.nome_usuario IS 'Nome de usuário único (máximo 256 caracteres)';
