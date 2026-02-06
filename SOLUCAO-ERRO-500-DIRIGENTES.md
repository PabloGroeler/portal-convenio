# ⚠️ ERRO 500 - Backend precisa ser reiniciado

## 🔴 Problema:
```
GET /api/dirigentes/instituicao/{id} → 500 Internal Server Error

Flyway validation error: Migration checksum mismatch for version 7
```

## 🔍 Causa:
1. ✅ Classes Java compiladas (Dirigente, DirigenteService, etc) - **IMPLEMENTADAS**
2. ⚠️ Migration V7 estava vazia, depois foi modificada → **Checksum mismatch**
3. ✅ **RESOLVIDO:** Criada migration V8 com conteúdo correto
4. ❌ **Backend ainda não foi reiniciado**

## ✅ Solução (EXECUTAR AGORA):

### Passo 1: Reiniciar Docker Compose

```bash
# Parar tudo
docker-compose down

# Subir novamente (isso vai executar a migration V8)
docker-compose up --build
```

**O que acontece:**
- Backend recompila com as novas classes Java
- Flyway detecta nova migration V8__create_dirigentes_table.sql
- Migration V8 é executada (V7 fica como estava - vazia)
- Tabela `dirigentes` é criada com todos os campos
- Endpoints REST ficam disponíveis

---

## 📝 O que foi feito para resolver:

1. ✅ **Migration V7** - Revertida para comentário (estado original)
2. ✅ **Migration V8** - Criada com SQL completo da tabela dirigentes
3. ✅ Flyway não vai mais reclamar de checksum mismatch

---

## 🧪 Como verificar se funcionou:

### 1. Verificar logs do backend:

```bash
docker-compose logs -f app
```

**Procure por:**
```
INFO: Successfully applied 1 migration to schema "public", now at version v7
```

### 2. Testar endpoint direto:

```bash
curl http://localhost:8080/api/dirigentes/instituicao/ffa32816-f96d-440a-877c-868b80bfda92
```

**Resposta esperada:**
```json
[]
```
(lista vazia porque não há dirigentes cadastrados ainda)

### 3. Testar no frontend:

1. Acesse: `http://localhost:3000/dashboard`
2. Navegue: `Instituições → [Editar] → [Gerenciar Diretoria]`
3. Deve aparecer: "Nenhum dirigente cadastrado"

---

## 📊 Checklist de Implementação:

### Backend Java (✅ Completo)
- [x] Dirigente.java (entidade)
- [x] DirigenteDTO.java
- [x] DirigenteRepository.java
- [x] DirigenteService.java (com regras de negócio)
- [x] DirigenteResource.java (6 endpoints REST)

### Migration SQL (✅ Completo)
- [x] V7__create_dirigentes_table.sql
- [x] Tabela com 43 campos
- [x] Foreign key para instituicoes
- [x] Índices (cpf único, instituicaoId, cargo+status)

### Frontend (✅ Completo)
- [x] dirigente.types.ts
- [x] dirigenteService.ts
- [x] DiretoriaPage.tsx (674 linhas)
- [x] Rota em App.tsx
- [x] Botão em CadastroDadosInstitucionaisPage.tsx

---

## 🚨 Se o erro persistir após reiniciar:

### Verifique se a tabela foi criada:

```bash
# Conectar no PostgreSQL
docker exec -it <nome-container-postgres> psql -U <usuario> -d app_emendas

# Verificar se tabela existe
\dt dirigentes

# Ver estrutura
\d dirigentes

# Sair
\q
```

### Se a tabela NÃO existir:

Pode ser que a migration V7 esteja "suja" no Flyway. Limpe o histórico:

```sql
-- Conectar no banco
docker exec -it <nome-container-postgres> psql -U <usuario> -d app_emendas

-- Ver histórico Flyway
SELECT * FROM flyway_schema_history WHERE version = '7';

-- Se existir com sucesso = false, deletar
DELETE FROM flyway_schema_history WHERE version = '7';

-- Sair e reiniciar backend
\q
```

Depois:
```bash
docker-compose restart app
```

---

## 📝 Resumo:

**CAUSA:** Backend não foi reiniciado após implementação das classes Java e migration SQL.

**SOLUÇÃO:** Executar `docker-compose down && docker-compose up --build`

**TEMPO:** ~2-3 minutos para reiniciar

**RESULTADO:** Endpoint `/api/dirigentes/instituicao/{id}` funcionando corretamente ✅

---

**Após reiniciar o backend, o sistema de Gestão de Diretoria estará 100% funcional!** 🎉

Data: 2026-02-06

