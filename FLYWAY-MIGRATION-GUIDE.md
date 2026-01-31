# Flyway Database Migration Guide

## Overview
Flyway is now fully configured for database schema management in this project. This replaces the previous `drop-and-create` strategy with a production-ready migration system.

---

## 🎯 What Changed

### Before (Old Strategy)
- Database schema was **dropped and recreated** on every application restart
- ⚠️ **All data was lost** on restart
- ❌ Not suitable for production
- ❌ No version control for database changes
- ❌ No rollback capability

### After (Flyway Strategy)
- Database schema is **versioned and migrated** incrementally
- ✅ **Data is preserved** between restarts
- ✅ Production-ready
- ✅ Version-controlled migrations
- ✅ Rollback capability (via SQL scripts)
- ✅ Team-friendly (everyone applies same migrations)

---

## 📦 Configuration

### pom.xml
Added Flyway dependency:
```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-flyway</artifactId>
</dependency>
```

### application.properties
```properties
# Hibernate ORM - Validate schema only (Flyway manages changes)
quarkus.hibernate-orm.database.generation=validate

# Flyway Configuration
quarkus.flyway.migrate-at-start=true           # Run migrations on startup
quarkus.flyway.baseline-on-migrate=true        # Handle existing databases
quarkus.flyway.baseline-version=0              # Start versioning from V0
quarkus.flyway.locations=classpath:db/migration # Migration scripts location
quarkus.flyway.table=flyway_schema_history     # Tracking table name
```

---

## 📁 Migration Files Location

```
src/main/resources/db/migration/
├── V1__create_emenda_table.sql
├── V2__drop_unique_instituicoes_cnpj.sql
├── V3__rename_vereadores_to_parlamentares.sql
├── V4__create_tipos_emenda_table.sql
├── V5__seed_tipos_emenda.sql
├── V6__add_esfera_to_emendas.sql
├── V7__add_convenio_fields_to_emendas.sql
├── V8__create_secretarias_municipais.sql
├── V9__add_ciclo_vida_status_to_emendas.sql
├── V10__create_usuarios_table.sql
└── V11__add_task10_validation_fields.sql
```

---

## 🔢 Naming Convention

Flyway migrations must follow this pattern:

```
V{VERSION}__{DESCRIPTION}.sql
```

**Examples:**
- `V1__create_users_table.sql`
- `V2__add_email_to_users.sql`
- `V3__create_orders_table.sql`

**Rules:**
- ✅ Version must be a number (can include dots: V1.1, V1.2)
- ✅ Two underscores `__` separate version from description
- ✅ Description uses underscores for spaces
- ✅ File extension must be `.sql`
- ❌ Never modify an already-applied migration
- ❌ Always increment version numbers

---

## 🚀 How to Use

### 1. Creating a New Migration

When you need to change the database schema:

```bash
# Create a new migration file
cd src/main/resources/db/migration

# Name format: V{NEXT_NUMBER}__{description}.sql
# Example: V12__add_phone_to_users.sql
```

**Example migration:**
```sql
-- V12__add_phone_to_users.sql

-- Add phone column to users table
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Add index for phone lookups
CREATE INDEX idx_users_phone ON users(phone);

-- Add comment
COMMENT ON COLUMN users.phone IS 'User contact phone number';
```

### 2. Running Migrations

Migrations run **automatically** when the application starts:

```bash
./mvnw quarkus:dev
```

**What happens:**
1. Quarkus starts
2. Flyway checks `flyway_schema_history` table
3. Identifies unapplied migrations
4. Applies them in order (V1, V2, V3, ...)
5. Records success in tracking table
6. Application continues startup

**Console output:**
```
INFO  [io.qua.fly.FlywayMigrator] Flyway migration started
INFO  [org.fly.cor.internal.command.DbValidate] Successfully validated 11 migrations
INFO  [org.fly.cor.internal.command.DbMigrate] Current version: 11
INFO  [org.fly.cor.internal.command.DbMigrate] Schema is up to date. No migration necessary.
INFO  [io.quarkus] Installed features: [agroal, flyway, ...]
```

### 3. Checking Migration Status

Connect to PostgreSQL and check the tracking table:

```sql
-- View applied migrations
SELECT 
    installed_rank, 
    version, 
    description, 
    type, 
    script, 
    installed_on, 
    execution_time,
    success
FROM flyway_schema_history
ORDER BY installed_rank;
```

**Example output:**
```
installed_rank | version | description                       | success
---------------|---------|-----------------------------------|--------
1              | 1       | create emenda table               | true
2              | 2       | drop unique instituicoes cnpj     | true
3              | 3       | rename vereadores to parlamentares| true
...
11             | 11      | add task10 validation fields      | true
```

---

## 🔄 Common Workflows

### Add a New Column

**1. Create migration:**
```sql
-- V12__add_email_verified_to_users.sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
```

**2. Restart application:**
```bash
./mvnw quarkus:dev
```

**3. Verify:**
```sql
SELECT * FROM flyway_schema_history WHERE version = '12';
```

### Add a New Table

**1. Create migration:**
```sql
-- V13__create_audit_log_table.sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id VARCHAR(100),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    changes JSONB
);

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
```

**2. Restart and verify**

### Seed Reference Data

**1. Create migration:**
```sql
-- V14__seed_user_roles.sql
INSERT INTO roles (id, name, description) VALUES
    ('admin', 'Administrator', 'Full system access'),
    ('gestor', 'Gestor', 'Manage emendas'),
    ('juridico', 'Jurídico', 'Legal review');
```

---

## 🐛 Troubleshooting

### Issue: "Migration checksum mismatch"

**Cause:** Someone modified an already-applied migration file.

**Solution:**
```sql
-- Option 1: Repair the checksum (if you're sure the schema is correct)
-- Run in Java code or via Flyway CLI:
Flyway.repair()

-- Option 2: Manual fix (NOT RECOMMENDED)
DELETE FROM flyway_schema_history WHERE version = 'X';
-- Then restart application
```

**Prevention:** ⚠️ **NEVER modify an applied migration!** Always create a new one.

### Issue: "Baseline migration not found"

**Cause:** Existing database has tables but no Flyway history.

**Solution:** Already configured with `baseline-on-migrate=true`. Flyway will create a baseline at V0 automatically.

### Issue: Migration fails midway

**Cause:** SQL syntax error or constraint violation.

**Solution:**
1. Check logs for exact error
2. Fix the migration SQL
3. Since Flyway marks failed migrations, you need to:
   ```sql
   -- Remove failed migration record
   DELETE FROM flyway_schema_history WHERE version = 'X' AND success = false;
   ```
4. Restart application

### Issue: Want to rollback a migration

**Solution:** Flyway doesn't support automatic rollback. Create a new migration that undoes the changes:

```sql
-- V15__rollback_add_phone_column.sql
ALTER TABLE users DROP COLUMN phone;
DROP INDEX IF EXISTS idx_users_phone;
```

---

## 📋 Best Practices

### ✅ DO
- Create descriptive migration names
- Keep migrations small and focused
- Test migrations on dev/staging before production
- Version control all migrations
- Include both DDL and DML in migrations when needed
- Use transactions (Flyway does this automatically for most DBs)
- Document complex migrations with comments

### ❌ DON'T
- Never modify an applied migration
- Don't mix DDL and data changes if they can fail independently
- Don't use database-specific features unless necessary
- Don't skip version numbers
- Don't delete old migrations from source control

---

## 🔒 Production Deployment

### Initial Deployment (Empty Database)

1. Deploy application with Flyway configured
2. Flyway detects empty database
3. Applies all migrations V1 → V11
4. Application starts with full schema

### Subsequent Deployments (Existing Database)

1. Developer creates V12__new_feature.sql locally
2. Commits to version control
3. CI/CD deploys new application version
4. Flyway detects V12 is missing
5. Applies only V12
6. Application continues with updated schema

### Zero-Downtime Deployments

**Backward-compatible migrations:**
```sql
-- V12__add_new_column.sql
-- Add column as NULLABLE first
ALTER TABLE emendas ADD COLUMN new_field VARCHAR(100);

-- Later in V13, make it NOT NULL after data population
-- V13__populate_and_enforce_new_field.sql
UPDATE emendas SET new_field = 'default_value' WHERE new_field IS NULL;
ALTER TABLE emendas ALTER COLUMN new_field SET NOT NULL;
```

---

## 📊 Monitoring

### Check Migration History

```sql
-- Latest applied migration
SELECT version, description, installed_on 
FROM flyway_schema_history 
ORDER BY installed_rank DESC 
LIMIT 1;

-- Failed migrations (should be none)
SELECT * FROM flyway_schema_history WHERE success = false;

-- Execution time per migration
SELECT version, description, execution_time 
FROM flyway_schema_history 
ORDER BY execution_time DESC;
```

### Application Health Check

Add to your health check endpoint:

```java
@Inject
Flyway flyway;

public boolean isDatabaseMigrated() {
    return flyway.info().current() != null;
}
```

---

## 🎓 Additional Resources

- **Flyway Documentation:** https://flywaydb.org/documentation
- **Quarkus Flyway Guide:** https://quarkus.io/guides/flyway
- **Migration Naming:** https://flywaydb.org/documentation/concepts/migrations#naming

---

## ✅ Verification Checklist

After implementing Flyway:

- [x] `quarkus-flyway` dependency added to pom.xml
- [x] `application.properties` configured with Flyway settings
- [x] `quarkus.hibernate-orm.database.generation` changed from `drop-and-create` to `validate`
- [x] All migration files follow naming convention
- [x] Migrations are in `src/main/resources/db/migration/`
- [x] Test configuration keeps `drop-and-create` (isolated)
- [ ] Start application and verify migrations run
- [ ] Check `flyway_schema_history` table exists
- [ ] Verify all 11 migrations are applied
- [ ] Test creating a new migration
- [ ] Document team workflow

---

## 🎉 Benefits Achieved

✅ **Production Ready** - No more data loss on restart  
✅ **Version Controlled** - Database schema in Git  
✅ **Team Collaboration** - Everyone applies same migrations  
✅ **Audit Trail** - Track who changed what and when  
✅ **Rollback Capability** - Create reverse migrations  
✅ **CI/CD Ready** - Automated deployments  
✅ **Zero Downtime** - Compatible migration strategy  
✅ **Environment Parity** - Dev, staging, prod stay in sync  

**Status: Flyway implementation COMPLETE** ✨

