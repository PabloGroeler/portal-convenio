# 🔍 DEBUG - Por que usuarios_instituicoes não está inserindo?

## 📋 Checklist de Verificação

### 1️⃣ Verificar Logs do Backend

Após criar uma instituição, procure por estas mensagens **na ordem**:

```
✅ Esperado:
🔵 CREATE INSTITUTION - Authorization Header: PRESENTE
INFO  Instituição criada com ID: xxxx
INFO  Tentando vincular usuário à instituição...
INFO  Token extraído: eyJhbG...
INFO  Username extraído do token: xxxx
INFO  Usuário encontrado: xxxx (ID: X)
INFO  Verificando vínculo existente...
INFO  Vínculo existente: NÃO
INFO  Criando novo vínculo...
INFO  Persistindo vínculo - usuarioId: X, instituicaoId: xxxx
INFO  ✅ Vínculo PERSISTIDO com sucesso! ID: X
INFO  Confirmação: 1 vínculo(s) encontrado(s) no banco

❌ Se aparecer:
🔵 CREATE INSTITUTION - Authorization Header: AUSENTE
→ Token não está sendo enviado pelo frontend!

❌ Se aparecer:
⚠️ Nenhum token JWT fornecido no header Authorization
→ Token não chega ou não tem "Bearer " no início

❌ Se aparecer:
Usuário encontrado: null (ID: null)
→ Username do token não corresponde a nenhum usuário no banco

❌ Se aparecer:
Vínculo existente: SIM
→ Vínculo já foi criado antes (verificar banco)
```

### 2️⃣ Verificar Request do Frontend (Chrome DevTools)

**Abra DevTools (F12) > Aba Network > Filtro: XHR**

1. Crie uma instituição
2. Procure por `POST /api/institutions`
3. Clique na requisição
4. Vá em **Headers**

**Verifique:**
```
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ✅ DEVE ESTAR PRESENTE!
  Content-Type: application/json
```

**Se Authorization NÃO estiver presente:**
- Token não está no localStorage
- api.ts não está adicionando o header
- Usuário não está logado

### 3️⃣ Verificar Token no LocalStorage

**No Console do navegador (F12 > Console):**

```javascript
// Ver token
const token = localStorage.getItem('token');
console.log('Token:', token);
// Resultado esperado: "eyJhbGciOiJIUzI1N..."

// Ver user
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('User:', user);
// Resultado esperado: {id: 10, username: "joao.silva", ...}

// Se token for null:
// → Fazer login novamente!
```

### 4️⃣ Verificar Banco de Dados

**Conectar ao banco:**
```bash
# Windows
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -h localhost -p 5433 -U postgres -d app_emendas

# Ou via SQL Shell (psql)
# Host: localhost
# Port: 5433
# Database: app_emendas
# Username: postgres
# Password: postgres
```

**Execute o script:**
```sql
-- Ver todos os vínculos
SELECT * FROM usuarios_instituicoes ORDER BY id DESC LIMIT 10;

-- Se estiver vazio = NÃO ESTÁ INSERINDO!
-- Se tiver dados = JÁ INSERIU ANTES

-- Ver estrutura da tabela
\d usuarios_instituicoes

-- Deve mostrar:
--  Column        | Type
-- ---------------+--------------------------------
--  id            | bigint (PK)
--  usuario_id    | bigint (NOT NULL)
--  instituicao_id| character varying(255) (NOT NULL)
--  data_vinculo  | timestamp with time zone
--  ativo         | boolean

-- Tentar inserir manualmente
INSERT INTO usuarios_instituicoes (usuario_id, instituicao_id, data_vinculo, ativo)
VALUES (1, 'test-123', NOW(), true);

-- Se der erro = problema na estrutura
-- Se funcionar = problema está no código Java
```

### 5️⃣ Verificar Username no Token vs Banco

**No banco:**
```sql
-- Ver usuários cadastrados
SELECT id, nome_usuario, nome_completo, email FROM usuarios;

-- Resultado exemplo:
--  id | nome_usuario | nome_completo | email
-- ----+--------------+---------------+------------------
--   1 | joao.silva   | João Silva    | joao@test.com
```

**No token JWT:**
```javascript
// No console do navegador
const token = localStorage.getItem('token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('JWT Payload:', payload);
// Deve mostrar: {sub: "joao.silva", userId: 1, ...}
```

**⚠️ IMPORTANTE:** `payload.sub` deve ser EXATAMENTE igual a `nome_usuario` no banco!

### 6️⃣ Testar com cURL (Bypass Frontend)

```bash
# 1. Fazer login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"12345678909","password":"sua_senha"}' \
  -o login.json

# Ver token retornado
cat login.json
# Copiar o valor do campo "token"

# 2. Criar instituição COM TOKEN
curl -X POST http://localhost:8080/api/institutions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "razaoSocial": "Teste CURL",
    "cnpj": "12345678000199",
    "inscricaoMunicipal": "123456",
    "telefone": "6533221122",
    "emailInstitucional": "teste.curl@test.com",
    "cep": "78000000",
    "logradouro": "Rua Teste",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "Sinop",
    "uf": "MT",
    "numeroRegistroConselhoMunicipal": "123456"
  }' \
  -v

# 3. Verificar logs do backend IMEDIATAMENTE
# Procure por: "🔵 CREATE INSTITUTION" e "✅ Vínculo PERSISTIDO"

# 4. Verificar banco
psql -h localhost -p 5433 -U postgres -d app_emendas -c "SELECT * FROM usuarios_instituicoes ORDER BY id DESC LIMIT 1;"
```

### 7️⃣ Diagnóstico por Sintoma

| Sintoma | Causa Provável | Solução |
|---------|----------------|---------|
| Log: "Authorization Header: AUSENTE" | Token não enviado | Verificar api.ts e localStorage |
| Log: "Usuário encontrado: null" | Username diferente | Verificar nome_usuario no banco vs JWT.sub |
| Log: "Vínculo já existe" | Já foi criado antes | Verificar banco - pode estar funcionando! |
| Nenhum log de vínculo aparece | Endpoint não é chamado | Verificar URL e route |
| Erro na query | Nome de coluna errado | Verificar migration aplicada |
| "No such column" | Tabela não existe/mal criada | Recriar banco com clean-database.sql |

---

## 🎯 Ação Imediata

**Execute AGORA na seguinte ordem:**

### Passo 1: Verificar Se Token Está Sendo Enviado

```javascript
// No Console do navegador (F12):
localStorage.getItem('token')
// Se retornar null → FAZER LOGIN PRIMEIRO!
```

### Passo 2: Criar Instituição e Ver Logs

1. Crie uma instituição no frontend
2. Abra Docker Desktop > portal-emendas-backend > Logs
3. Procure por: `🔵 CREATE INSTITUTION`
4. **Se não aparecer** = endpoint não está sendo chamado
5. **Se aparecer "AUSENTE"** = token não está sendo enviado
6. **Se aparecer "PRESENTE"** = continue lendo os próximos logs

### Passo 3: Verificar Banco Imediatamente

```sql
-- Conecte e execute:
SELECT * FROM usuarios_instituicoes ORDER BY id DESC LIMIT 1;

-- Se retornar linha = FUNCIONOU! ✅
-- Se retornar vazio = continuar debug
```

### Passo 4: Verificar Username Match

```sql
-- No banco:
SELECT id, nome_usuario FROM usuarios WHERE id = 1;

-- No console do navegador:
const token = localStorage.getItem('token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('JWT username:', payload.sub);

-- Devem ser IGUAIS!
```

---

## 🚨 Problemas Comuns e Soluções

### Problema 1: Token Não Enviado

**Causa:** api.ts não está adicionando header Authorization

**Solução:** Verificar `src/services/api.ts`:

```typescript
// Deve ter algo assim:
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Problema 2: Username Não Match

**Causa:** JWT tem username diferente do banco

**Exemplo:**
- JWT: `{sub: "12345678909"}` (CPF)
- Banco: `nome_usuario = "joao.silva"`

**Solução:** Verificar o que está sendo usado no `JwtUtil.generateToken()`:

```java
// AuthService.java - linha do generateToken:
String token = JwtUtil.generateToken(user.username, user.id);
// OU
String token = JwtUtil.generateToken(user.cpf, user.id);

// Deve usar o mesmo campo que User.findByUsername() busca!
```

### Problema 3: Transação Não Commita

**Causa:** Exceção silenciosa ou falta de @Transactional

**Solução:** Já foi corrigido com `flush()` e logs

### Problema 4: Tabela Não Existe/Corrompida

**Causa:** Migration não aplicada corretamente

**Solução:**
```bash
# Limpar e recriar
psql -h localhost -p 5433 -U postgres -d app_emendas -f clean-database.sql

# Reiniciar app
docker-compose down
docker-compose up --build
```

---

## 📊 Fluxo de Debug Ideal

```
1. ✅ Login → Obter token
   └─ Verificar: localStorage.getItem('token') !== null

2. ✅ Criar instituição
   └─ Verificar: Network tab → Authorization header presente

3. ✅ Backend recebe request
   └─ Verificar logs: "🔵 CREATE INSTITUTION - Authorization Header: PRESENTE"

4. ✅ Token é extraído e validado
   └─ Verificar logs: "Token extraído: ..." e "Username extraído: ..."

5. ✅ Usuário é encontrado
   └─ Verificar logs: "Usuário encontrado: xxxx (ID: X)"
   └─ Se null → PROBLEMA AQUI!

6. ✅ Vínculo é verificado
   └─ Verificar logs: "Vínculo existente: NÃO"
   └─ Se SIM → já foi criado antes

7. ✅ Vínculo é persistido
   └─ Verificar logs: "✅ Vínculo PERSISTIDO com sucesso!"
   └─ Verificar logs: "Confirmação: 1 vínculo(s) encontrado(s)"

8. ✅ Confirmar no banco
   └─ SELECT * FROM usuarios_instituicoes ORDER BY id DESC LIMIT 1;
```

**Se algum passo falhar, pare e corrija antes de continuar!**

---

## 🛠️ Arquivos para Verificar

| Arquivo | O Que Verificar |
|---------|----------------|
| `InstitutionResource.java` | Logs aparecendo? |
| `api.ts` | Authorization header sendo adicionado? |
| `JwtUtil.java` | O que está em `generateToken()`? |
| `AuthService.java` | O que é passado para `generateToken()`? |
| `User.java` | Método `findByUsername()` busca qual campo? |
| `application.properties` | Configuração do banco correta? |

---

**🎯 Execute o Passo 1 agora e me informe o resultado!**

Qual mensagem aparece nos logs: "PRESENTE" ou "AUSENTE"?

