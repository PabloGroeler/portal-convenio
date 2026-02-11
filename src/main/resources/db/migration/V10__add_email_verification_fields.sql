-- Migration: Add email verification fields to usuarios table
-- Date: 2026-02-11
-- Description: Adds columns for email verification functionality

-- Add email verification token field
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS token_verificacao VARCHAR(64);

-- Add email verification token expiry field
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS token_verificacao_expira TIMESTAMP WITH TIME ZONE;

-- Add email verified flag
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT FALSE;

-- Add index for faster token lookup
CREATE INDEX IF NOT EXISTS idx_usuarios_token_verificacao ON usuarios(token_verificacao);

-- Add comments
COMMENT ON COLUMN usuarios.token_verificacao IS 'Token usado para verificar email (expira em 24 horas)';
COMMENT ON COLUMN usuarios.token_verificacao_expira IS 'Data/hora de expiração do token de verificação de email';
COMMENT ON COLUMN usuarios.email_verificado IS 'Indica se o email do usuário foi verificado';
