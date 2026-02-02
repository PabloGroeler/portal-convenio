# ✅ Database Column Error - FIXED

## Error Message
```
column c1_0.councilor_id does not exist
```

## Root Cause
The database still has **old English column names** (`councilor_id`, `full_name`, etc.) but the Java entities have been updated to use **Portuguese column names** (`id_parlamentar`, `nome_completo`, etc.).

The Flyway migration **V12** that renames all columns has **not been applied yet** to your database.

---

## Files Updated

### ✅ Backend Entities
1. **Councilor.java** - Updated all field names to Portuguese:
   - `councilorId` → `idParlamentar`
   - `fullName` → `nomeCompleto`
   - `politicalParty` → `partidoPolitico`
   - `createTime` → `dataCriacao`
   - `updateTime` → `dataAtualizacao`

### ✅ Backend Services
2. **CouncilorService.java** - Updated to use Portuguese field names
3. **EmendaDetailDTO.java** - Updated Councilor field references
4. **PublicDataImportService.java** - Updated Councilor creation/updates

---

## Solution: Apply Database Migration

### Option 1: Restart Quarkus Application (Recommended)

**Stop** your running application and **restart** it. Flyway will automatically apply the V12 migration:

```bash
# Stop the application (Ctrl+C)

# Restart
./mvnw quarkus:dev
```

**What will happen:**
1. Flyway detects V12 migration is not applied
2. Executes V12 SQL script
3. Renames all database columns from English to Portuguese:
   - `councilor_id` → `id_parlamentar`
   - `full_name` → `nome_completo`
   - `political_party` → `partido_politico`
   - `councilor_id`, `official_code`, `date`, `value`, etc. in `emendas` table
   - And more...
4. Application starts with correct schema

**Expected Console Output:**
```
INFO  [org.fly.cor.internal.command.DbMigrate] Migrating schema to version 12 - rename columns to portuguese
INFO  [org.fly.cor.internal.command.DbMigrate] Successfully applied 1 migration
INFO  [io.quarkus] Quarkus started on http://localhost:8080
```

---

### Option 2: Manual Migration (If Flyway Disabled)

If Flyway is disabled or you prefer manual migration:

```bash
# Connect to PostgreSQL
psql -U your_user -d your_database

# Run migration manually
\i src/main/resources/db/migration/V12__rename_columns_to_portuguese.sql
```

---

### Option 3: Drop and Recreate Database (Development Only)

⚠️ **WARNING: This deletes all data!**

```bash
# Drop database
psql -U your_user -c "DROP DATABASE your_database;"

# Create database
psql -U your_user -c "CREATE DATABASE your_database;"

# Restart application - Flyway will create schema from scratch with all migrations
./mvnw quarkus:dev
```

---

## Verification Steps

### 1. Check Database Schema

After restarting, verify the columns were renamed:

```sql
-- Connect to database
psql -U your_user -d your_database

-- Check parlamentares table columns
\d parlamentares

-- Should show:
-- id_parlamentar (not councilor_id)
-- nome_completo (not full_name)
-- partido_politico (not political_party)
-- data_criacao (not create_time)
-- data_atualizacao (not update_time)
```

### 2. Check Flyway History

```sql
SELECT version, description, success, installed_on 
FROM flyway_schema_history 
ORDER BY installed_rank;
```

Should show V12 as applied:
```
version | description                    | success | installed_on
--------|--------------------------------|---------|-------------
...
12      | rename columns to portuguese   | t       | 2026-02-01...
```

### 3. Test Application

Try accessing the application:
```bash
# Test parlamentares endpoint
curl http://localhost:8080/api/councilors

# Should return data without errors
```

---

## Why This Happened

1. ✅ Java entities were updated with Portuguese field names
2. ✅ Migration V12 was created to rename database columns
3. ❌ Application was **not restarted** after creating V12
4. ❌ Database still has old English column names
5. 💥 **Mismatch** between Java entity column mappings and actual database schema

---

## Translation Summary

### Emenda Fields
| Old (English) | New (Portuguese) |
|---------------|------------------|
| councilorId | idParlamentar |
| officialCode | codigoOficial |
| date | data |
| value | valor |
| classification | classificacao |
| category | categoria |
| status | situacao |
| federalStatus | statusFederal |
| institutionId | idInstituicao |
| signedLink | linkAssinado |
| attachments | anexos |
| description | descricao |
| objectDetail | objetoDetalhado |
| createTime | dataCriacao |
| updateTime | dataAtualizacao |

### Councilor Fields
| Old (English) | New (Portuguese) |
|---------------|------------------|
| councilorId | idParlamentar |
| fullName | nomeCompleto |
| politicalParty | partidoPolitico |
| createTime | dataCriacao |
| updateTime | dataAtualizacao |

### Institution Fields
| Old (English) | New (Portuguese) |
|---------------|------------------|
| createTime | dataCriacao |
| updateTime | dataAtualizacao |

---

## Status After Fixes

✅ **Java Code** - All entities, services, and DTOs updated  
⏳ **Database** - Needs migration (restart app to apply)  
⏳ **Frontend** - Still needs updating with Portuguese field names  

---

## Next Actions

### Immediate (Required)
1. **Stop** your Quarkus application
2. **Restart** it: `./mvnw quarkus:dev`
3. **Verify** V12 migration applied successfully
4. **Test** application endpoints

### After Database Migration
5. Update frontend TypeScript interfaces
6. Update frontend service calls
7. Update frontend components
8. Test end-to-end functionality

---

**RESTART YOUR APPLICATION NOW** to apply the database migration and fix the column error! 🚀

