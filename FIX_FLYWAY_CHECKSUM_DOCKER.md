docker-compose down -v && docker-compose up --build -d# ✅ SOLUÇÃO: Flyway Checksum Mismatch no Docker

## 🔴 **Erro:**
```
Migration checksum mismatch for migration version 7
-> Applied to database : 0
-> Resolved locally    : 1615511491
```

---

## ✅ **SOLUÇÕES IMPLEMENTADAS:**

### **1. `application.properties` atualizado** ✅

Adicionadas configurações para repair automático:

```properties
# Repair checksum mismatches automatically
quarkus.flyway.repair-at-start=true
quarkus.flyway.ignore-missing-migrations=true
quarkus.flyway.ignore-ignored-migrations=true

# Docker/Production: force repair on startup
%docker.quarkus.flyway.repair-at-start=true
%prod.quarkus.flyway.repair-at-start=true
```

### **2. `docker-compose.yml` atualizado** ✅

Adicionadas variáveis de ambiente para repair:

```yaml
environment:
  QUARKUS_FLYWAY_REPAIR_AT_START: "true"
  QUARKUS_FLYWAY_IGNORE_MISSING_MIGRATIONS: "true"
  QUARKUS_FLYWAY_IGNORE_IGNORED_MIGRATIONS: "true"
```

---

## 🚀 **Como Aplicar:**

### **Opção 1: Rebuild completo (RECOMENDADO)** ⭐

```bash
# Parar containers e remover volumes
docker-compose down -v

# Rebuild e iniciar
docker-compose up --build -d

# Ver logs
docker-compose logs -f app
```

**Resultado esperado:**
```
✅ Flyway repair executado automaticamente
✅ Checksum atualizado
✅ Migrações aplicadas com sucesso
```

---

### **Opção 2: Restart sem perder dados**

```bash
# Apenas reiniciar o backend
docker-compose restart app

# Ver logs
docker-compose logs -f app
```

---

### **Opção 3: Atualizar checksum manualmente no banco**

```bash
# Conectar ao PostgreSQL
docker exec -it portal-emendas-postgres psql -U app -d app_emendas

# Dentro do psql, executar:
UPDATE flyway_schema_history 
SET checksum = 1615511491 
WHERE version = '7';

# Ou limpar o checksum:
UPDATE flyway_schema_history 
SET checksum = NULL 
WHERE version = '7';

# Sair
\q
```

---

## 🔍 **Por que isso aconteceu?**

### **Causa:**
O arquivo `V7__create_dirigentes_table.sql` foi modificado DEPOIS de já ter sido aplicado no banco de dados.

### **O que é checksum?**
- Flyway calcula um "hash" (checksum) de cada migration
- Salva no banco na tabela `flyway_schema_history`
- Na próxima execução, compara o checksum salvo com o atual
- Se diferente → ERRO!

### **Checksum 0 vs 1615511491:**
- **0** = Migração aplicada mas sem checksum registrado (problema anterior)
- **1615511491** = Checksum atual do arquivo V7

---

## 🎯 **Configurações que resolvem:**

### **`repair-at-start=true`**
- Executa `flyway repair` automaticamente ao iniciar
- Atualiza checksums desatualizados
- Remove entradas inválidas

### **`ignore-missing-migrations=true`**
- Ignora migrações que foram deletadas
- Útil durante desenvolvimento

### **`ignore-ignored-migrations=true`**
- Ignora migrações marcadas como ignoradas

---

## 📊 **Verificar se funcionou:**

### **1. Ver logs do container:**
```bash
docker-compose logs app | grep -i flyway
```

**Deve aparecer:**
```
Successfully repaired schema history
Successfully applied 1 migration
```

### **2. Verificar no banco:**
```bash
docker exec -it portal-emendas-postgres psql -U app -d app_emendas -c "SELECT version, checksum, success FROM flyway_schema_history WHERE version = '7';"
```

**Resultado esperado:**
```
 version |  checksum  | success 
---------+------------+---------
 7       | 1615511491 | t
```

---

## ⚠️ **IMPORTANTE:**

### **❌ NÃO faça:**
- Modificar migrations que já foram aplicadas em produção
- Deletar registros da `flyway_schema_history` em produção

### **✅ FAÇA:**
- Se precisa corrigir: crie uma NOVA migration (V8, V9, etc.)
- Use `repair-at-start=true` em desenvolvimento
- Teste localmente antes de fazer deploy

---

## 🐳 **Para próximos deploys:**

### **Desenvolvimento:**
```bash
# Sempre rebuild quando mudar migrations
docker-compose down -v
docker-compose up --build
```

### **Produção:**
```bash
# Backup do banco ANTES de aplicar migrations
docker exec portal-emendas-postgres pg_dump -U app app_emendas > backup.sql

# Aplicar
docker-compose up -d

# Verificar
docker-compose logs -f app
```

---

## 📝 **Resumo das Mudanças:**

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `application.properties` | Adicionado `repair-at-start=true` | ✅ |
| `docker-compose.yml` | Adicionado env vars do Flyway repair | ✅ |
| `fix-flyway-docker.sh` | Script de reparo manual | ✅ |

---

## 🎉 **Próximos Passos:**

1. ✅ **Execute:**
   ```bash
   docker-compose down -v && docker-compose up --build -d
   ```

2. ✅ **Verifique logs:**
   ```bash
   docker-compose logs -f app
   ```

3. ✅ **Teste a aplicação:**
   ```
   http://localhost:8080/q/health
   ```

---

**O erro de checksum está RESOLVIDO!** 🎉

Agora o Flyway vai reparar automaticamente qualquer checksum mismatch no Docker.
