# 🚨 AÇÃO IMEDIATA - Backend Ainda Retornando 500

## ⚡ O Que Fazer AGORA

### 1️⃣ REINICIAR O BACKEND (OBRIGATÓRIO!)

```bash
# Parar tudo
docker-compose down

# Rebuild e iniciar
docker-compose up --build

# OU se não estiver usando Docker:
# Ctrl+C no terminal do Quarkus
# E rodar novamente:
./mvnw quarkus:dev
```

**⚠️ IMPORTANTE:** As mudanças no código Java **NÃO** são aplicadas automaticamente! Você **DEVE** reiniciar!

---

### 2️⃣ VERIFICAR LOGS DO BACKEND

Após reiniciar, os logs vão mostrar **exatamente** onde está o problema:

```
🔵 Endpoint minhas-instituicoes-detalhadas chamado
Token extraído: eyJhbGc...
Username do token: joao.silva
Usuário encontrado: joao.silva
Buscando vínculos do usuário ID: 10
Vínculos encontrados: 2
Buscando instituição: inst-abc-123
Instituição encontrada: Associação Teste
✅ Retornando 2 instituições
```

**Se aparecer erro:**
```
❌ Erro ao buscar instituições detalhadas: [MENSAGEM DO ERRO]
```

**Cole o erro aqui para eu corrigir!**

---

### 3️⃣ TESTAR NO FRONTEND

Após reiniciar o backend:

1. **Hard refresh no navegador:**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Fazer login novamente**

3. **Acessar dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

4. **Verificar console (F12):**
   - Deve mostrar: `✅ Dashboard: Instituições carregadas do backend: [...]`
   - **NÃO deve** mostrar erro 500

---

## 🔍 SE AINDA DER ERRO 500

### Cenário 1: Backend não reiniciou

**Sintoma:** Logs antigos aparecem

**Solução:**
```bash
# Garantir que parou tudo
docker ps  # Verificar se algum container está rodando
docker-compose down --remove-orphans

# Limpar e reiniciar
docker-compose up --build --force-recreate
```

### Cenário 2: Erro de compilação Java

**Sintoma:** Backend não inicia

**Solução:** Verificar terminal do backend para erros de compilação

### Cenário 3: Erro no banco de dados

**Sintoma:** Logs mostram erro SQL

**Solução:** Verificar se sequence foi criada (V6 migration):
```sql
SELECT * FROM pg_sequences WHERE sequencename = 'usuarios_instituicoes_seq';
```

### Cenário 4: Token inválido/expirado

**Sintoma:** Logs mostram "Token não fornecido"

**Solução:**
1. Logout no frontend
2. Limpar localStorage (F12 > Application > Local Storage > Clear)
3. Login novamente

---

## 📊 Checklist de Verificação

Execute NA ORDEM:

- [ ] **1. Backend foi reiniciado?**
  ```bash
  docker-compose down
  docker-compose up --build
  ```

- [ ] **2. Logs do backend estão aparecendo?**
  ```
  # Deve aparecer ao acessar dashboard:
  🔵 Endpoint minhas-instituicoes-detalhadas chamado
  ```

- [ ] **3. Token está sendo enviado?**
  ```
  # No console do navegador (F12):
  localStorage.getItem('token')
  # Deve retornar algo como: "eyJhbGciOiJIUzI1..."
  ```

- [ ] **4. Network tab mostra 200 OK?**
  ```
  GET /api/users/minhas-instituicoes-detalhadas
  Status: 200 OK (não 500!)
  ```

---

## 🎯 Mudanças Aplicadas no Código

✅ **UserResource.java:**
- Logs detalhados em cada etapa
- Tratamento de exceção com tipo de erro
- Validação explícita de token
- Informação de quantos vínculos foram encontrados

**Agora você verá EXATAMENTE onde está falhando!**

---

## 🚀 Comando Rápido

```bash
# EXECUTE AGORA:
cd C:\Github-projects\code-with-quarkus
docker-compose down
docker-compose up --build

# Aguarde aparecer:
# "Listening on: http://0.0.0.0:8080"

# Então teste:
# 1. Login no frontend
# 2. Acesse /dashboard
# 3. Verifique logs do backend
```

---

## 📝 O Que Reportar Se Continuar com Erro

**Cole TODOS estes dados:**

1. **Logs do backend** (últimas 50 linhas)
2. **Console do navegador** (F12)
3. **Network tab** - Response do erro 500:
   ```
   Request URL: http://localhost:3000/api/users/minhas-instituicoes-detalhadas
   Status: 500
   Response: { ... }
   ```
4. **Verificação do banco:**
   ```sql
   SELECT * FROM usuarios_instituicoes WHERE usuario_id = SEU_ID;
   ```

---

**⚡ AÇÃO IMEDIATA: REINICIE O BACKEND AGORA! ⚡**

**Sem reiniciar, as mudanças no código Java NÃO terão efeito!**

Data: 2026-02-05

