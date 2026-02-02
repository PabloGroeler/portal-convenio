# 🔧 Correção do Erro 500 - /api/emendas/with-details

## Data: 02 de Fevereiro de 2026

---

## ❌ Erro Encontrado

```
GET http://localhost:3000/api/emendas/with-details 500 (Internal Server Error)
```

---

## 🐛 Causa Raiz

### Problema 1: Nomes de Classes Incorretos ✅ CORRIGIDO

No arquivo `EmendaService.java`, método `enrichEmendaWithDetails()`:

**Antes (ERRADO):**
```java
private EmendaDetailDTO enrichEmendaWithDetails(Emenda emenda) {
    Instituicao instituicao = null;  // ❌ Classe não existe
    Parlamentar parlamentar = null;   // ❌ Classe não existe
    
    if (emenda.idInstituicao != null && !emenda.idInstituicao.isBlank()) {
        instituicao = institutionService.findByInstitutionId(emenda.idInstituicao);
    }
    
    if (emenda.idParlamentar != null && !emenda.idParlamentar.isBlank()) {
        parlamentar = councilorService.findByCouncilorId(emenda.idParlamentar);
    }
    
    return new EmendaDetailDTO(emenda, instituicao, parlamentar);
}
```

**Depois (CORRETO):**
```java
private EmendaDetailDTO enrichEmendaWithDetails(Emenda emenda) {
    Institution institution = null;  // ✅ Classe correta
    Councilor councilor = null;       // ✅ Classe correta
    
    if (emenda.idInstituicao != null && !emenda.idInstituicao.isBlank()) {
        institution = institutionService.findByInstitutionId(emenda.idInstituicao);
    }
    
    if (emenda.idParlamentar != null && !emenda.idParlamentar.isBlank()) {
        councilor = councilorService.findByCouncilorId(emenda.idParlamentar);
    }
    
    return new EmendaDetailDTO(emenda, institution, councilor);
}
```

---

## 🔍 Possíveis Causas Adicionais

### Problema 2: Migração V12 Não Aplicada ⚠️

Se o erro persistir após a correção acima, pode ser que a **migração V12** ainda não tenha sido aplicada ao banco de dados.

**Sintomas:**
- Erro 500 persiste
- Logs do backend mostram: `column "councilor_id" does not exist`
- Ou: `column "official_code" does not exist`

**Solução:**
```bash
# 1. Pare o backend (Ctrl+C)

# 2. Verifique se a migração foi aplicada
psql -U your_user -d your_database
SELECT * FROM flyway_schema_history WHERE version = '12';

# Se não foi aplicada, aplique manualmente:
\i src/main/resources/db/migration/V12__rename_columns_to_portuguese.sql

# 3. Reinicie o backend
./mvnw quarkus:dev
```

### Problema 3: Banco de Dados Desatualizado ⚠️

Se você não aplicou a migração, o banco ainda tem colunas em inglês:
- `councilor_id` (deveria ser `id_parlamentar`)
- `official_code` (deveria ser `codigo_oficial`)
- `date` (deveria ser `data`)
- `value` (deveria ser `valor`)
- etc.

**Verificar colunas:**
```sql
-- Conectar ao banco
psql -U your_user -d your_database

-- Verificar estrutura da tabela emendas
\d emendas

-- Verificar estrutura da tabela parlamentares
\d parlamentares

-- Verificar estrutura da tabela instituicoes
\d instituicoes
```

---

## ✅ Checklist de Resolução

### Passo 1: Verificar Correção de Código
- [x] EmendaService.java corrigido
- [x] Nomes de classes corretos (Institution, Councilor)
- [x] Sem erros de compilação

### Passo 2: Verificar Banco de Dados
- [ ] Verificar se migração V12 foi aplicada
- [ ] Verificar se colunas estão em português
- [ ] Verificar se não há erros nos logs do backend

### Passo 3: Testar
- [ ] Reiniciar backend
- [ ] Testar endpoint: `GET http://localhost:8080/api/emendas/with-details`
- [ ] Verificar se retorna 200 OK
- [ ] Verificar se frontend carrega emendas

---

## 🧪 Como Testar

### Teste 1: Backend Direto
```bash
# Testar endpoint diretamente
curl http://localhost:8080/api/emendas/with-details

# Deve retornar 200 OK com JSON:
# [
#   {
#     "id": "123",
#     "idParlamentar": "abc",
#     "codigoOficial": "001-001-2026",
#     "data": "2026-01-01",
#     "valor": 10000,
#     ...
#   }
# ]
```

### Teste 2: Frontend
```
1. Abrir http://localhost:3000
2. Fazer login
3. Acessar página de Emendas
4. Verificar se lista carrega sem erro 500
```

---

## 📋 Logs para Verificar

### No Console do Backend
Procure por:
```
✅ Sucesso:
INFO  [io.quarkus] Quarkus started
INFO  Migrating schema to version 12

❌ Erro (se migração não foi aplicada):
ERROR column "councilor_id" does not exist
ERROR column "official_code" does not exist
```

### No Console do Frontend
Procure por:
```
✅ Sucesso:
[EmendasPage] Fetching emendas from API...
[EmendasPage] Received data: [...]
[EmendasPage] Mapped emendas: [...]

❌ Erro:
GET http://localhost:3000/api/emendas/with-details 500
[EmendasPage] Error fetching emendas: AxiosError
```

---

## 🔧 Correção Aplicada

**Arquivo:** `src/main/java/org/acme/service/EmendaService.java`

**Mudanças:**
1. `Instituicao` → `Institution`
2. `Parlamentar` → `Councilor`
3. `instituicao` → `institution`
4. `parlamentar` → `councilor`

**Status:** ✅ Corrigido

---

## 📊 Status de Resolução

| Item | Status |
|------|--------|
| Código Java corrigido | ✅ FEITO |
| Compilação sem erros | ✅ VERIFICADO |
| Banco de dados atualizado | ⏳ A VERIFICAR |
| Endpoint funcionando | ⏳ A TESTAR |
| Frontend carregando | ⏳ A TESTAR |

---

## 🚀 Próximos Passos

1. **Reinicie o backend** se ainda não fez:
   ```bash
   # Ctrl+C para parar
   ./mvnw quarkus:dev
   ```

2. **Verifique os logs** do backend ao iniciar

3. **Teste o endpoint** diretamente:
   ```bash
   curl http://localhost:8080/api/emendas/with-details
   ```

4. **Se ainda der erro 500:**
   - Verifique os logs do backend
   - Verifique se a migração V12 foi aplicada
   - Verifique as colunas do banco de dados

5. **Teste o frontend:**
   - Acesse http://localhost:3000
   - Faça login
   - Acesse a página de Emendas
   - Verifique se a lista carrega

---

## 📞 Se o Erro Persistir

Cole aqui os seguintes logs:

1. **Logs do backend** (últimas 50 linhas):
   ```bash
   # Últimas linhas do console onde o backend está rodando
   ```

2. **Resultado do curl**:
   ```bash
   curl -v http://localhost:8080/api/emendas/with-details
   ```

3. **Status da migração**:
   ```sql
   SELECT version, description, success, installed_on 
   FROM flyway_schema_history 
   ORDER BY installed_rank DESC 
   LIMIT 5;
   ```

4. **Estrutura da tabela**:
   ```sql
   \d emendas
   ```

---

**Data de Correção:** 02 de Fevereiro de 2026  
**Status:** ✅ Código corrigido - Aguardando teste

