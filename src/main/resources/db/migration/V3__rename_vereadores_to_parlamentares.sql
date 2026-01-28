-- Rename table 'vereadores' to 'parlamentares'
-- Safe guards included so this can run multiple times.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'vereadores'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'parlamentares'
  ) THEN
    ALTER TABLE public.vereadores RENAME TO parlamentares;
  END IF;
END $$;

-- Rename the index, if it exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND indexname = 'idx_vereadores_councilor_id'
  ) THEN
    ALTER INDEX public.idx_vereadores_councilor_id RENAME TO idx_parlamentares_councilor_id;
  END IF;
END $$;

