-- Migration: Add password reset fields to usuarios table
-- Date: 2026-02-11
-- Description: Adds columns for password reset functionality

-- Add password reset token field
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS token_redefinir_senha VARCHAR(64);

-- Add password reset token expiry field
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS token_redefinir_senha_expira TIMESTAMP WITH TIME ZONE;

-- Add index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_usuarios_token_redefinir_senha ON usuarios(token_redefinir_senha);

-- Add comment
COMMENT ON COLUMN usuarios.token_redefinir_senha IS 'Token usado para redefinir senha (expira em 1 hora)';
COMMENT ON COLUMN usuarios.token_redefinir_senha_expira IS 'Data/hora de expiração do token de redefinição de senha';
