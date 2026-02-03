# 🔧 Troubleshooting: Database Not Being Created

## Problema
O banco de dados `app-emendas` não está sendo criado durante o `docker-compose up`.

---

## ✅ Soluções Implementadas

### 1. **docker-compose.yml Atualizado**

Adicionamos:
- ✅ `container_name` para identificação fácil
- ✅ `restart: unless-stopped` para auto-restart
- ✅ `PGDATA` para evitar conflitos de diretório
- ✅ Script de inicialização `init-db.sql`
- ✅ Healthcheck robusto

```yaml
postgres:
  image: postgres:16
  container_name: portal-emendas-postgres
  environment:
    POSTGRES_DB: app-emendas
    POSTGRES_USER: app
    POSTGRES_PASSWORD: app
    PGDATA: /var/lib/postgresql/data/pgdata
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U app -d app-emendas"]
```

---

## 🚀 Como Resolver (Passo a Passo)

### Método 1: Restart Completo (Recomendado)

```powershell
# 1. Parar tudo
docker-compose down

# 2. Remover volumes antigos (APAGA DADOS!)
docker volume rm code-with-quarkus_postgres_data

# 3. Rebuild e start
docker-compose up --build

# 4. Verificar
docker exec portal-emendas-postgres psql -U app -d app-emendas -c "\l"
```

### Método 2: Usar Script Automatizado

```powershell
# Execute o script de startup
.\docker-startup.bat

# Esse script faz tudo automaticamente!
```

### Método 3: Diagnóstico Completo

```powershell
# Execute diagnóstico
.\docker-diagnose.bat

# Mostra todos os logs e status
```

---

## 🔍 Verificações Manuais

### 1. Verificar se PostgreSQL está rodando
```powershell
docker ps | findstr postgres
```

**Esperado:**
```
portal-emendas-postgres   Up XX minutes (healthy)
```

### 2. Verificar logs do PostgreSQL
```powershell
docker-compose logs postgres
```

**Esperado:**
```
postgres    | database system is ready to accept connections
postgres    | LOG:  database "app-emendas" created
```

### 3. Verificar se banco existe
```powershell
docker exec portal-emendas-postgres psql -U app -d postgres -c "\l"
```

**Esperado:**
```
 app-emendas | app  | UTF8
```

### 4. Tentar conectar ao banco
```powershell
docker exec portal-emendas-postgres psql -U app -d app-emendas -c "SELECT 1;"
```

**Esperado:**
```
 ?column? 
----------
        1
```

---

## ❌ Problemas Comuns e Soluções

### Problema 1: "database does not exist"

**Causa:** Volume antigo com dados corrompidos

**Solução:**
```powershell
docker-compose down -v
docker-compose up
```

### Problema 2: "role 'app' does not exist"

**Causa:** PostgreSQL não criou o usuário

**Solução:**
```powershell
docker exec -it portal-emendas-postgres psql -U postgres -c "CREATE USER app WITH PASSWORD 'app';"
docker exec -it portal-emendas-postgres psql -U postgres -c "CREATE DATABASE \"app-emendas\" OWNER app;"
```

### Problema 3: Healthcheck falhando

**Causa:** Banco ainda não foi criado quando healthcheck executa

**Solução:** Aguardar mais tempo ou verificar logs:
```powershell
docker-compose logs postgres | Select-String "ready"
```

### Problema 4: Backend não conecta

**Causa:** URL de conexão incorreta ou banco não pronto

**Verificar variáveis:**
```powershell
docker exec portal-emendas-backend printenv | findstr DATASOURCE
```

**Esperado:**
```
QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://postgres:5432/app-emendas
QUARKUS_DATASOURCE_USERNAME=app
QUARKUS_DATASOURCE_PASSWORD=app
```

---

## 🛠️ Comandos Úteis

### Ver todos os containers
```powershell
docker-compose ps
```

### Ver logs em tempo real
```powershell
docker-compose logs -f postgres
docker-compose logs -f app
```

### Conectar ao PostgreSQL manualmente
```powershell
docker exec -it portal-emendas-postgres psql -U app -d app-emendas
```

### Listar todos os bancos
```powershell
docker exec portal-emendas-postgres psql -U app -d postgres -c "\l"
```

### Ver tabelas criadas
```powershell
docker exec portal-emendas-postgres psql -U app -d app-emendas -c "\dt"
```

### Ver migrations do Flyway
```powershell
docker exec portal-emendas-postgres psql -U app -d app-emendas -c "SELECT * FROM flyway_schema_history;"
```

### Resetar tudo (CUIDADO!)
```powershell
docker-compose down -v
docker system prune -a
docker-compose up --build
```

---

## 📝 Checklist de Verificação

Antes de relatar um problema, verifique:

- [ ] Docker está rodando
- [ ] Porta 5433 não está em uso por outro processo
- [ ] Porta 8080 não está em uso
- [ ] Arquivo `init-db.sql` existe na raiz do projeto
- [ ] Arquivo `docker-compose.yml` está correto
- [ ] Migrations em `src/main/resources/db/migration/` existem
- [ ] Volume antigo foi removido (`docker volume ls`)
- [ ] Logs não mostram erros críticos

---

## 🎯 Ordem de Inicialização Esperada

```
1. docker-compose up
   ↓
2. PostgreSQL container inicia
   ↓
3. PostgreSQL executa init-db.sql (se volume novo)
   ↓
4. Cria banco "app-emendas"
   ↓
5. Healthcheck passa (pg_isready)
   ↓
6. Backend container inicia
   ↓
7. Flyway conecta ao banco
   ↓
8. Flyway cria flyway_schema_history
   ↓
9. Flyway aplica V1, V2, V3
   ↓
10. Quarkus app inicia
    ↓
11. Frontend container inicia
    ↓
12. ✅ Sistema pronto!
```

---

## 📊 Logs Esperados (Sucesso)

### PostgreSQL:
```
postgres    | PostgreSQL Database directory appears to contain a database; Skipping initialization
postgres    | 2026-02-02 15:00:00.000 UTC [1] LOG:  starting PostgreSQL 16.x
postgres    | 2026-02-02 15:00:01.000 UTC [1] LOG:  database system is ready to accept connections
```

### Backend (Flyway):
```
app    | Flyway Community Edition 9.x.x
app    | Database: jdbc:postgresql://postgres:5432/app-emendas
app    | Successfully validated 3 migrations
app    | Creating Schema History table "public"."flyway_schema_history"
app    | Current version of schema "public": << Empty Schema >>
app    | Migrating schema "public" to version "1 - initial schema"
app    | Migrating schema "public" to version "2 - seed tipos emenda"
app    | Migrating schema "public" to version "3 - seed admin user"
app    | Successfully applied 3 migrations to schema "public"
```

---

## 💡 Dica Final

Se nada funcionar, faça um **reset completo**:

```powershell
# 1. Parar e remover tudo
docker-compose down -v
docker system prune -a -f

# 2. Limpar cache do Docker
docker builder prune -a -f

# 3. Rebuild completo
docker-compose build --no-cache

# 4. Iniciar
docker-compose up

# 5. Verificar
.\docker-diagnose.bat
```

---

## 📞 Ainda com Problemas?

Execute:
```powershell
.\docker-diagnose.bat > diagnostics.txt
```

E compartilhe o arquivo `diagnostics.txt` para análise detalhada.

---

**✨ Com essas correções, o banco deve ser criado automaticamente! ✨**

