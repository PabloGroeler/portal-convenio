-- V40: Add secretaria field to usuarios table for SECRETARIA role users
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS secretaria VARCHAR(300);

