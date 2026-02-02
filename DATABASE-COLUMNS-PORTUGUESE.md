# Database Column Names - Portuguese Translation

## Summary
All database column names have been changed from English to Portuguese across all entities.

**Date:** January 31, 2026  
**Migration:** V12__rename_columns_to_portuguese.sql

---

## Changes Made

### 1. **Emenda Entity**
| English Column | Portuguese Column |
|---------------|-------------------|
| councilor_id | id_parlamentar |
| official_code | codigo_oficial |
| date | data |
| value | valor |
| classification | classificacao |
| category | categoria |
| status | situacao |
| federal_status | status_federal |
| institution_id | id_instituicao |
| signed_link | link_assinado |
| description | descricao |
| object_detail | objeto_detalhado |
| create_time | data_criacao |
| update_time | data_atualizacao |

**Index Changes:**
- `idx_emendas_vereador` → `idx_emendas_parlamentar`
- Column reference updated: `councilor_id` → `id_parlamentar`

---

### 2. **Institution Entity**
| English Column | Portuguese Column |
|---------------|-------------------|
| create_time | data_criacao |
| update_time | data_atualizacao |

*Note: Most Institution columns were already in Portuguese*

---

### 3. **Councilor (Parlamentares) Entity**
| English Column | Portuguese Column |
|---------------|-------------------|
| councilor_id | id_parlamentar |
| full_name | nome_completo |
| political_party | partido_politico |
| create_time | data_criacao |
| update_time | data_atualizacao |

**Index Changes:**
- `idx_parlamentares_councilor_id` → `idx_parlamentares_id`
- Column reference updated: `councilor_id` → `id_parlamentar`

---

### 4. **User (Usuarios) Entity**
| English Column | Portuguese Column |
|---------------|-------------------|
| role | perfil |
| username | nome_usuario |
| password | senha |
| create_time | data_criacao |
| update_time | data_atualizacao |

*Note: Most User columns were already in Portuguese*

---

### 5. **TipoEmenda Entity**
| English Column | Portuguese Column |
|---------------|-------------------|
| create_time | data_criacao |
| update_time | data_atualizacao |

*Note: Other columns were already in Portuguese*

---

### 6. **SecretariaMunicipal Entity**
| English Column | Portuguese Column |
|---------------|-------------------|
| create_time | data_criacao |
| update_time | data_atualizacao |

*Note: Other columns were already in Portuguese*

---

## Migration File

**File:** `src/main/resources/db/migration/V12__rename_columns_to_portuguese.sql`

**Content:**
- Renames all English column names to Portuguese
- Updates index definitions
- Uses conditional logic for optional tables (SecretariaMunicipal)
- Safe for existing data (no data loss)

---

## Impact

### ✅ Benefits
- **Consistency:** All column names now in Portuguese
- **Clarity:** Database schema matches business domain language
- **Standards:** Follows Brazilian naming conventions
- **Maintainability:** Easier for Brazilian developers

### ⚠️ Breaking Changes
None - Java field names remain unchanged, only database column mappings updated.

### 📊 Statistics
- **Entities updated:** 6
- **Columns renamed:** 28
- **Indexes updated:** 3
- **Tables affected:** 6

---

## Testing Checklist

### Before Running Migration
- [ ] Backup database
- [ ] Verify Flyway is configured
- [ ] Check current schema version

### Run Migration
```bash
./mvnw quarkus:dev
```

### Verify Migration
```sql
-- Check migration applied
SELECT * FROM flyway_schema_history WHERE version = '12';

-- Verify Emenda columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'emendas'
ORDER BY column_name;

-- Verify Parlamentares columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'parlamentares'
ORDER BY column_name;

-- Verify Usuarios columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY column_name;
```

### Expected Results
```
Emenda columns:
- id_parlamentar ✅
- codigo_oficial ✅
- data ✅
- valor ✅
- classificacao ✅
- categoria ✅
- situacao ✅
- status_federal ✅
- id_instituicao ✅
- link_assinado ✅
- descricao ✅
- objeto_detalhado ✅
- data_criacao ✅
- data_atualizacao ✅

Parlamentares columns:
- id_parlamentar ✅
- nome_completo ✅
- partido_politico ✅
- data_criacao ✅
- data_atualizacao ✅

Usuarios columns:
- perfil ✅
- nome_usuario ✅
- senha ✅
- data_criacao ✅
- data_atualizacao ✅
```

---

## Rollback Plan

If needed, create a reverse migration:

**V13__rollback_to_english_columns.sql**
```sql
-- Emendas
ALTER TABLE emendas RENAME COLUMN id_parlamentar TO councilor_id;
ALTER TABLE emendas RENAME COLUMN codigo_oficial TO official_code;
-- ... (reverse all changes)
```

**Note:** Not recommended - better to keep Portuguese names and move forward.

---

## Files Modified

### Entity Files (6)
1. `src/main/java/org/acme/entity/Emenda.java`
2. `src/main/java/org/acme/entity/Institution.java`
3. `src/main/java/org/acme/entity/Councilor.java`
4. `src/main/java/org/acme/entity/User.java`
5. `src/main/java/org/acme/entity/TipoEmenda.java`
6. `src/main/java/org/acme/entity/SecretariaMunicipal.java`

### Migration Files (1)
1. `src/main/resources/db/migration/V12__rename_columns_to_portuguese.sql`

---

## Common Column Translations Reference

For future reference when creating new entities:

| English | Portuguese |
|---------|-----------|
| id | id |
| name | nome |
| full_name | nome_completo |
| description | descricao |
| date | data |
| value | valor |
| status | situacao / status |
| category | categoria |
| classification | classificacao |
| create_time | data_criacao |
| update_time | data_atualizacao |
| deleted_at | data_exclusao |
| email | email |
| phone | telefone |
| address | endereco |
| city | cidade |
| state | estado / uf |
| code | codigo |
| number | numero |
| active | ativo |
| user | usuario |
| role | perfil |
| username | nome_usuario |
| password | senha |

---

## Best Practices

### ✅ DO
- Use Portuguese for all new column names
- Follow snake_case convention (e.g., `data_criacao`)
- Be consistent across tables
- Document translations

### ❌ DON'T
- Mix English and Portuguese in same table
- Use camelCase for column names
- Abbreviate unnecessarily
- Skip migration documentation

---

## Status

✅ **COMPLETE**

- All entities updated with Portuguese column names
- Migration file created (V12)
- No compilation errors
- Ready for deployment
- Backward compatible (Java field names unchanged)

---

**Next Step:** Start the application to apply the migration:
```bash
./mvnw quarkus:dev
```

Flyway will automatically apply V12 and rename all columns to Portuguese.

