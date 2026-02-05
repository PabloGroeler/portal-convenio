# 🔍 DEBUG - Instituições não aparecem no Dashboard

## 🎯 Mudanças Aplicadas

### Problema Identificado:
O dashboard estava verificando `user.instituicoes` do localStorage antes de buscar do backend, e como esse valor pode estar desatualizado, não mostrava as instituições mesmo que existissem em `usuarios_instituicoes`.

### Solução Implementada:

1. ✅ **Sempre busca do backend primeiro**
   - Não depende mais de `user.instituicoes` do localStorage
   - Chama `getMinhasInstituicoesDetalhadas()` ao carregar

2. ✅ **Estado independente para `hasInstituicoes`**
   - Antes: Calculado a partir de `user.instituicoes` (pode estar desatualizado)
   - Agora: Atualizado com base na resposta do backend

3. ✅ **Logs de debug adicionados**
   - Console mostra cada etapa do carregamento
   - Fácil identificar onde está falhando

---

## 🧪 Como Testar

### 1. Abrir DevTools Console (F12)

### 2. Fazer Login

Você deve ver no console:
```
🔍 Dashboard: Checking user data: { id: X, ... }
🔍 Dashboard: user.instituicoes: [...]
✅ Dashboard: Instituições carregadas do backend: [{ id: "...", razaoSocial: "...", ... }]
```

### 3. Verificar Chamada à API

**Network Tab:**
```
GET /api/users/minhas-instituicoes-detalhadas
Status: 200 OK
Response: [
  {
    "id": "inst-abc-123",
    "razaoSocial": "...",
    "ativo": true,
    ...
  }
]
```

### 4. Verificar Estado do Dashboard

No console, após carregar:
```javascript
// Verificar se cards aparecem
document.querySelectorAll('.bg-white.rounded-lg.shadow-md').length
// Deve ser > 0 se houver instituições
```

---

## 📊 Fluxo Corrigido

### ANTES (Problemático):
```
1. Dashboard carrega
2. Verifica: user.instituicoes?.length > 0
3. Se FALSE → Não busca backend
4. Mostra alerta amarelo mesmo tendo vínculos
```

### AGORA (Correto):
```
1. Dashboard carrega
2. SEMPRE busca do backend: getMinhasInstituicoesDetalhadas()
3. Backend consulta usuarios_instituicoes + instituicoes
4. Retorna array completo com dados
5. Atualiza estado: hasInstituicoes = data.length > 0
6. Renderiza cards se houver dados
```

---

## 🔍 Verificar Dados no Banco

```sql
-- 1. Ver vínculos do usuário
SELECT 
    ui.id,
    ui.usuario_id,
    ui.instituicao_id,
    ui.ativo,
    u.nome_completo,
    i.razao_social
FROM usuarios_instituicoes ui
JOIN usuarios u ON u.id = ui.usuario_id
JOIN instituicoes i ON i.id_instituicao = ui.instituicao_id
WHERE u.id = SEU_USER_ID  -- Substituir pelo ID do seu usuário
  AND ui.ativo = true;

-- Deve retornar linhas se houver vínculos!
```

---

## ⚠️ Possíveis Problemas e Soluções

### Problema 1: "❌ Dashboard: Erro ao buscar instituições"

**Console mostra erro 401 ou 403:**
```
Causa: Token expirado ou ausente
Solução: Fazer logout e login novamente
```

**Console mostra erro 500:**
```
Causa: Erro no backend
Solução: Verificar logs do backend
```

### Problema 2: Backend retorna array vazio `[]`

**Verificar:**
```sql
-- O usuário tem vínculos ativos?
SELECT * FROM usuarios_instituicoes 
WHERE usuario_id = SEU_USER_ID AND ativo = true;

-- As instituições existem?
SELECT * FROM instituicoes 
WHERE id_instituicao IN (
  SELECT instituicao_id FROM usuarios_instituicoes 
  WHERE usuario_id = SEU_USER_ID
);
```

### Problema 3: Cards não aparecem mesmo com dados

**Console mostra dados mas UI não atualiza:**
```
Causa: Cache do React ou problema de renderização
Solução: Hard refresh (Ctrl+Shift+R)
```

---

## 🎯 Checklist de Debug

Execute na ordem:

- [ ] **1. Login no sistema**
- [ ] **2. Abrir Console (F12)**
- [ ] **3. Verificar logs:**
  - [ ] `🔍 Dashboard: Checking user data`
  - [ ] `✅ Dashboard: Instituições carregadas`
- [ ] **4. Verificar Network Tab:**
  - [ ] Request: `GET /api/users/minhas-instituicoes-detalhadas`
  - [ ] Status: `200 OK`
  - [ ] Response: Array com dados
- [ ] **5. Verificar UI:**
  - [ ] Alerta amarelo NÃO aparece
  - [ ] Cards de instituições aparecem
  - [ ] Dados corretos nos cards

---

## 📝 Logs Esperados

### Se TIVER instituições:

```javascript
🔍 Dashboard: Checking user data: {id: 10, email: "...", ...}
🔍 Dashboard: user.instituicoes: ["inst-abc-123"]
✅ Dashboard: Instituições carregadas do backend: [
  {
    id: "inst-abc-123",
    razaoSocial: "Instituição Teste",
    nomeFantasia: "Teste",
    cnpj: "12345678000100",
    emailInstitucional: "teste@test.com",
    telefone: "6533221122",
    cidade: "Sinop",
    uf: "MT",
    dataVinculo: "2026-02-04T15:30:00Z",
    ativo: true
  }
]
```

### Se NÃO TIVER instituições:

```javascript
🔍 Dashboard: Checking user data: {id: 10, email: "...", ...}
🔍 Dashboard: user.instituicoes: []
✅ Dashboard: Instituições carregadas do backend: []
```

---

## 🚀 Teste Rápido

```bash
# 1. Limpar cache
cd frontend
rm -rf node_modules/.vite .vite dist

# 2. Reiniciar dev server
npm run dev

# 3. Hard refresh no browser
# Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)

# 4. Fazer login novamente

# 5. Abrir /dashboard

# 6. Verificar console
```

---

## ✅ Resultado Esperado

**Se houver vínculos no banco:**
- ✅ Cards de instituições aparecem
- ✅ Informações completas exibidas
- ✅ Status "Ativo" visível
- ✅ Data de vínculo formatada
- ✅ Links de navegação funcionando

**Se não houver vínculos:**
- ⚠️ Alerta amarelo aparece
- ⚠️ Botão "Vincular Instituição" visível
- ⚠️ Mensagem explicativa

---

## 📊 Arquivos Modificados

| Arquivo | Mudança |
|---------|---------|
| `DashboardHomePage.tsx` | ✅ Busca sempre do backend |
| | ✅ Estado independente para hasInstituicoes |
| | ✅ Logs de debug adicionados |
| | ✅ Usa instituicoes.length em vez de user.instituicoes |

---

**🎯 TESTE AGORA: Faça login e abra o dashboard. Verifique o console para logs!**

Se continuar não aparecendo, cole aqui:
1. Os logs do console
2. A resposta do Network Tab para `/api/users/minhas-instituicoes-detalhadas`
3. O resultado da query SQL acima

Data: 2026-02-05

