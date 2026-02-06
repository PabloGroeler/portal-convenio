# 🚀 GUIA RÁPIDO - Resolver Flyway V7

## ⚡ Execute em ORDEM:

### 1️⃣ Limpar histórico do Flyway

**PowerShell:**
```powershell
cd C:\Github-projects\code-with-quarkus
.\fix-flyway.ps1
```

**Resultado esperado:**
```
✅ Container encontrado: portal-emendas-postgres
🗑️  Deletando migration V7 do histórico do Flyway...
Migration V7 deletada!
```

---

### 2️⃣ Reiniciar backend

```bash
docker-compose restart app
```

**OU reiniciar tudo:**
```bash
docker-compose down
docker-compose up --build
```

---

### 3️⃣ Verificar logs

```bash
docker-compose logs -f app | grep -i flyway
```

**Procure por:**
```
INFO: Successfully applied 1 migration to schema "public", now at version v8
```

---

### 4️⃣ Testar endpoint

```bash
curl http://localhost:8080/api/dirigentes/instituicao/ffa32816-f96d-440a-877c-868b80bfda92
```

**Resposta esperada:** `[]` ✅

---

## 📁 Arquivos criados:

- ✅ `fix-flyway.ps1` - Script PowerShell (Windows)
- ✅ `fix-flyway.sh` - Script Bash (Linux/Mac)
- ✅ `fix-flyway-v7.sql` - SQL manual
- ✅ `V7__create_dirigentes_table.sql` - Vazio (0 bytes)
- ✅ `V8__create_dirigentes_table.sql` - SQL completo

---

## ❓ Se o script PowerShell não executar:

```powershell
# Permitir execução de scripts (uma vez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Executar novamente
.\fix-flyway.ps1
```

---

## ❓ Se não quiser usar o script:

**Opção manual:**
```bash
# 1. Conectar no PostgreSQL
docker exec -it <container-postgres> psql -U postgres -d app_emendas

# 2. Deletar V7
DELETE FROM flyway_schema_history WHERE version = '7';

# 3. Verificar
SELECT * FROM flyway_schema_history WHERE version = '7';
-- Deve retornar 0 linhas

# 4. Sair
\q

# 5. Reiniciar backend
docker-compose restart app
```

---

## 🎯 Resumo:

1. **Execute:** `.\fix-flyway.ps1`
2. **Execute:** `docker-compose restart app`
3. **Teste:** Frontend deve funcionar!

**Tempo total:** 2-3 minutos ⏱️

---

Data: 2026-02-06

