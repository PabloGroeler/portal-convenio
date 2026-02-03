-- This script ensures the database exists
-- PostgreSQL will automatically create the database specified in POSTGRES_DB
-- This is a backup initialization script

-- Create database if it doesn't exist (for manual initialization)
SELECT 'CREATE DATABASE "app_emendas"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'app_emendas')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "app_emendas" TO app;

-- Connect to the database
\c app_emendas;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Confirm database is ready
SELECT 'Database app_emendas is ready!' AS status;

