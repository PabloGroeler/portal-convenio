-- Fix migration for parlamentar_limites FK and column type
-- This migration is safe to run on databases where V55 already executed partially.

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Only proceed if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parlamentar_limites') THEN
        -- Drop FK constraint if it references wrong table
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'parlamentar_limites' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'parlamentar_id'
        ) THEN
            -- Try to find the constraint name(s) and drop them
            FOR constraint_name IN
                SELECT tc.constraint_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
                WHERE tc.table_name = 'parlamentar_limites' AND tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'parlamentar_id'
            LOOP
                EXECUTE format('ALTER TABLE parlamentar_limites DROP CONSTRAINT IF EXISTS %I', constraint_name);
            END LOOP;
        END IF;

        -- If column exists and is not varchar, try to alter its type to varchar(100)
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'parlamentar_limites' AND column_name = 'parlamentar_id') THEN
            PERFORM (
                SELECT CASE WHEN data_type NOT IN ('character varying','text') THEN 1 ELSE 0 END
                FROM information_schema.columns
                WHERE table_name = 'parlamentar_limites' AND column_name = 'parlamentar_id'
            );

            -- Alter column type to VARCHAR(100) using text cast if necessary
            BEGIN
                EXECUTE 'ALTER TABLE parlamentar_limites ALTER COLUMN parlamentar_id TYPE VARCHAR(100) USING parlamentar_id::text';
            EXCEPTION WHEN others THEN
                -- If alter fails, log a notice and continue
                RAISE NOTICE 'Could not alter parlamentar_id column type: %', SQLERRM;
            END;
        END IF;

        -- Add the correct foreign key to parlamentares(id_parlamentar)
        BEGIN
            ALTER TABLE parlamentar_limites
            ADD CONSTRAINT fk_parlamentar FOREIGN KEY (parlamentar_id) REFERENCES parlamentares(id_parlamentar) ON DELETE CASCADE;
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not add fk_parlamentar: %', SQLERRM;
        END;

        -- Ensure unique index exists
        BEGIN
            CREATE UNIQUE INDEX IF NOT EXISTS ux_parlamentar_ano ON parlamentar_limites (parlamentar_id, ano);
        EXCEPTION WHEN others THEN
            RAISE NOTICE 'Could not create ux_parlamentar_ano: %', SQLERRM;
        END;
    END IF;
END$$;
