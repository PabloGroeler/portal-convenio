# 🚀 Portal de Emendas - Guia Rápido de Inicialização

## ✅ Pré-requisitos

- Docker Desktop instalado e rodando
- Portas disponíveis: 3000 (frontend), 5433 (postgres), 8080 (backend)

---

## 🎯 Inicialização Rápida

### Opção 1: Script Automatizado (Recomendado)

```powershell
.\docker-startup.bat
```

**O que faz:**
- Para containers existentes
- Pergunta se deseja remover volumes (dados)
- Rebuild das images
- Inicia todos os serviços
- Mostra status e logs
- Verifica banco de dados
- Verifica migrations Flyway

### Opção 2: Manual

```powershell
# Parar containers existentes
docker-compose down

# Iniciar serviços
docker-compose up --build

# Em outro terminal, verificar status
docker-compose ps
```

---

## 🔍 Diagnóstico

Se algo não funcionar:

```powershell
.\docker-diagnose.bat
```

**O que verifica:**
- Status dos containers
- Logs do PostgreSQL e Backend
- Conexão com o banco
- Existência do banco app-emendas
- Tabelas criadas
- Migrations do Flyway
- Variáveis de ambiente

---

## 📊 Serviços Disponíveis

Após inicialização bem-sucedida:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Interface React |
| **Backend** | http://localhost:8080 | API Quarkus |
| **Swagger UI** | http://localhost:8080/swagger-ui | Documentação API |
| **PostgreSQL** | localhost:5433 | Banco de dados |

---

## 🗄️ Banco de Dados

### Informações de Conexão

```
Host: localhost
Port: 5433
Database: app-emendas
Username: app
Password: app
```

### Conectar via psql

```powershell
docker exec -it portal-emendas-postgres psql -U app -d app-emendas
```

### Comandos úteis no psql

```sql
\l              -- Listar bancos
\dt             -- Listar tabelas
\d usuarios     -- Descrever tabela
SELECT * FROM flyway_schema_history;  -- Ver migrations aplicadas
```

---

## 🔐 Credenciais Padrão

Após primeira inicialização:

```
Username: admin
Password: Admin@123
```

⚠️ **IMPORTANTE:** Altere essa senha no primeiro login!

---

## 📝 Estrutura do Banco

O Flyway cria automaticamente:

### Tabelas (11):
1. `usuarios` - Usuários do sistema
2. `instituicoes` - Instituições beneficiárias
3. `instituicoes_areas_atuacao` - Áreas de atuação
4. `parlamentares` - Parlamentares
5. `tipos_emenda` - Tipos de emendas (5 tipos pré-cadastrados)
6. `secretarias_municipais` - Secretarias municipais
7. `emendas` - Emendas parlamentares
8. `emendas_anexos` - Anexos das emendas
9. `emenda_historico` - Histórico de ações
10. `news` - Notícias
11. `flyway_schema_history` - Controle Flyway

---

## 🛠️ Comandos Úteis

### Ver logs em tempo real

```powershell
# Todos os serviços
docker-compose logs -f

# Apenas PostgreSQL
docker-compose logs -f postgres

# Apenas Backend
docker-compose logs -f app

# Apenas Frontend
docker-compose logs -f frontend
```

### Parar serviços

```powershell
# Parar mas manter volumes (dados preservados)
docker-compose down

# Parar e remover volumes (APAGA DADOS!)
docker-compose down -v
```

### Reiniciar um serviço específico

```powershell
docker-compose restart postgres
docker-compose restart app
docker-compose restart frontend
```

### Ver status dos containers

```powershell
docker-compose ps
```

### Acessar shell do container

```powershell
# PostgreSQL
docker exec -it portal-emendas-postgres bash

# Backend
docker exec -it portal-emendas-backend sh

# Frontend
docker exec -it portal-emendas-frontend sh
```

---

## 🔄 Reset Completo

Se precisar começar do zero:

```powershell
# 1. Parar e remover tudo
docker-compose down -v

# 2. Remover volumes órfãos
docker volume prune -f

# 3. Rebuild sem cache
docker-compose build --no-cache

# 4. Iniciar
docker-compose up
```

---

## ⚠️ Problemas Comuns

### "Database does not exist"

```powershell
docker-compose down -v
docker-compose up
```

### "Port already in use"

```powershell
# Windows: Verificar porta 5433
netstat -ano | findstr :5433

# Matar processo (substitua PID)
taskkill /PID <PID> /F
```

### "Flyway migrations failed"

```powershell
# Ver logs do backend
docker-compose logs app | Select-String "Flyway"

# Conectar ao banco e verificar
docker exec -it portal-emendas-postgres psql -U app -d app-emendas -c "SELECT * FROM flyway_schema_history;"
```

### Backend não conecta ao banco

```powershell
# Verificar se PostgreSQL está healthy
docker-compose ps

# Verificar variáveis de ambiente
docker exec portal-emendas-backend printenv | findstr QUARKUS
```

Para mais detalhes, consulte: **TROUBLESHOOTING-DATABASE.md**

---

## 📁 Estrutura de Arquivos

```
code-with-quarkus/
├── docker-compose.yml           # Configuração Docker Compose
├── init-db.sql                  # Script de inicialização do DB
├── docker-startup.bat           # Script de startup automatizado
├── docker-diagnose.bat          # Script de diagnóstico
├── TROUBLESHOOTING-DATABASE.md  # Guia de troubleshooting
├── FLYWAY-GUIDE.md             # Guia completo do Flyway
├── src/
│   └── main/
│       └── resources/
│           └── db/
│               └── migration/
│                   ├── V1__initial_schema.sql
│                   ├── V2__seed_tipos_emenda.sql
│                   └── V3__seed_admin_user.sql
└── frontend/
    └── ...
```

---

## 🎓 Documentação Adicional

- **FLYWAY-GUIDE.md** - Guia completo sobre migrations
- **TROUBLESHOOTING-DATABASE.md** - Solução de problemas
- **Swagger UI** - http://localhost:8080/swagger-ui (após iniciar)

---

## ✅ Checklist de Inicialização

Antes de considerar o sistema funcionando:

- [ ] PostgreSQL container está "healthy"
- [ ] Backend iniciou sem erros
- [ ] Frontend acessível em http://localhost:3000
- [ ] Swagger UI acessível em http://localhost:8080/swagger-ui
- [ ] Banco `app-emendas` existe
- [ ] Tabela `flyway_schema_history` existe
- [ ] 3 migrations aplicadas (V1, V2, V3)
- [ ] Usuário admin existe na tabela `usuarios`
- [ ] 5 tipos de emenda existem na tabela `tipos_emenda`

---

## 📞 Suporte

Se ainda tiver problemas:

1. Execute: `.\docker-diagnose.bat > diagnostics.txt`
2. Consulte `TROUBLESHOOTING-DATABASE.md`
3. Verifique logs: `docker-compose logs`

---

**✨ Bom desenvolvimento! ✨**

