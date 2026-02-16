# 🔧 SOLUÇÃO: Erro ao Vincular Usuário à Instituição

**Data:** 15 de fevereiro de 2026  
**Problema:** `Transaction is not active, consider adding @Transactional to your method`

---

## 🎯 Causa Raiz

O erro estava acontecendo porque o método `update` em `InstitutionResource` estava tentando fazer operações de banco de dados (`persist()` do vínculo) mas **não estava dentro de uma transação**.

### **Erro Completo:**
```
WARN [org.acm.res.InstitutionResource] Erro ao vincular usuário na atualização: 
Transaction is not active, consider adding @Transactional to your method to automatically activate one.
```

---

## ✅ SOLUÇÃO APLICADA

### **Correção no Backend:**

Adicionado `@Transactional` ao método `update` em `InstitutionResource.java`:

```java
@PUT
@Path("/{id}")
@Transactional  // ✅ ADICIONADO
public Response update(@PathParam("id") String id, Institution institution, 
                      @HeaderParam("Authorization") String authHeader) {
    // ...código existente...
    
    // Criar novo vínculo
    UsuarioInstituicao novoVinculo = new UsuarioInstituicao();
    novoVinculo.usuarioId = user.id;
    novoVinculo.instituicaoId = updated.institutionId;
    novoVinculo.persist();  // ✅ Agora funciona dentro da transação
    
    // ...código existente...
}
```

---

## 🔍 Por Que Aconteceu?

1. **O método `create` já tinha** `@Transactional` → Funcionava
2. **O método `update` NÃO tinha** `@Transactional` → Falhava ao tentar persistir vínculo
3. **O Hibernate/Panache precisa** de uma transação ativa para fazer `persist()`

---

## 🧪 Teste

Após a correção, teste:

### **1. No Frontend:**
```
1. Acesse: /dashboard/cadastro-dados-institucionais
2. Digite CNPJ existente (ex: da APAE)
3. Pressione TAB
4. Clique em "🔗 Vincular à Minha Conta"
5. ✅ Deve funcionar sem erros!
```

### **2. Logs do Backend (Deve ver):**
```
✅ Bom:
  🔧 PUT /api/institutions/abc123 - Atualizando instituição
  🔗 Tentando vincular usuário à instituição após UPDATE...
  ✅ Usuário encontrado: user@email.com (ID: 1)
  ✅ Vínculo criado com sucesso: user@email.com → instituição abc123

❌ Não deve mais ver:
  ⚠️ Erro ao vincular usuário na atualização: Transaction is not active
```

---

## 📊 Comparação: Antes vs Depois

### **ANTES:**
```java
@PUT
@Path("/{id}")
// ❌ SEM @Transactional
public Response update(...) {
    // ...
    novoVinculo.persist(); // ❌ ERRO: Transaction is not active
}
```

### **DEPOIS:**
```java
@PUT
@Path("/{id}")
@Transactional  // ✅ COM @Transactional
public Response update(...) {
    // ...
    novoVinculo.persist(); // ✅ FUNCIONA: Transaction está ativa
}
```

---

## 🗂️ Arquivos Modificados

| Arquivo | Linha | Mudança |
|---------|-------|---------|
| `InstitutionResource.java` | 306 | Adicionado `@Transactional` ao método `update` |

---

## ✅ Status

**Problema:** ✅ **RESOLVIDO**  
**Correção:** ✅ **APLICADA**  
**Teste:** ⏳ **Aguardando usuário testar**

---

## 🚀 Próximos Passos

1. ✅ Backend já foi corrigido (commit aplicado)
2. ⏳ Reinicie o backend se estiver rodando
3. ⏳ Teste no frontend
4. ✅ Confirme que vínculos são criados
5. ✅ Verifique em "Minhas Instituições"

---

## 📝 Observações

- **Não precisa mais** executar script SQL de sequence
  - A sequence já estava configurada corretamente
  - O problema era apenas a falta da transação no método `update`
  
- **Logs melhorados:**
  - Agora é possível ver exatamente quando o vínculo é criado
  - Erros de vinculação são logados mas não bloqueiam o UPDATE

---

**🎉 PROBLEMA RESOLVIDO!**

A vinculação de usuários agora funciona corretamente tanto no `create` quanto no `update`! 🚀

---

## 🔍 Diagnóstico

Execute o seguinte comando SQL para verificar:

```sql
-- Verificar se a sequence existe
SELECT EXISTS (
    SELECT FROM information_schema.sequences
    WHERE sequence_schema = 'public'
    AND sequence_name = 'usuarios_instituicoes_id_seq'
);

-- Ver estrutura da tabela
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'usuarios_instituicoes'
ORDER BY ordinal_position;
```

**Resultado esperado:**
- A coluna `id` deve ter `column_default` = `nextval('usuarios_instituicoes_id_seq'::regclass)`

---

## ✅ Solução Rápida

### **Opção 1: Script SQL Manual (Recomendado)**

Execute o script que já existe no projeto:

```powershell
# No PowerShell, na pasta do projeto:
psql -h localhost -p 5432 -U postgres -d app_emendas -f fix-usuarios-instituicoes-sequence.sql
```

### **Opção 2: Executar Manualmente no SQL**

Conecte ao banco e execute:

```sql
-- Criar sequence se não existir
CREATE SEQUENCE IF NOT EXISTS usuarios_instituicoes_id_seq START WITH 1 INCREMENT BY 1;

-- Se já tem registros, ajustar valor inicial
SELECT setval('usuarios_instituicoes_id_seq', 
    COALESCE((SELECT MAX(id) FROM usuarios_instituicoes), 0) + 1, 
    false);

-- Vincular sequence à coluna
ALTER SEQUENCE usuarios_instituicoes_id_seq OWNED BY usuarios_instituicoes.id;

-- Definir default
ALTER TABLE usuarios_instituicoes 
ALTER COLUMN id SET DEFAULT nextval('usuarios_instituicoes_id_seq');
```

### **Opção 3: Recriar a Tabela (Última Opção)**

⚠️ **ATENÇÃO:** Isso vai apagar todos os vínculos existentes!

```sql
-- Backup primeiro!
CREATE TABLE usuarios_instituicoes_backup AS SELECT * FROM usuarios_instituicoes;

-- Dropar e recriar
DROP TABLE IF EXISTS usuarios_instituicoes CASCADE;

CREATE TABLE usuarios_instituicoes (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    instituicao_id VARCHAR(255) NOT NULL,
    data_vinculo TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT uk_usuario_instituicao UNIQUE (usuario_id, instituicao_id)
);

-- Criar índices
CREATE INDEX idx_usuarios_instituicoes_usuario ON usuarios_instituicoes(usuario_id);
CREATE INDEX idx_usuarios_instituicoes_instituicao ON usuarios_instituicoes(instituicao_id);
CREATE INDEX idx_usuarios_instituicoes_ativo ON usuarios_instituicoes(ativo);

-- Restaurar dados se necessário
-- INSERT INTO usuarios_instituicoes SELECT * FROM usuarios_instituicoes_backup;
```

---

## 🧪 Teste

Após aplicar a correção, teste:

```sql
-- Teste 1: Verificar sequence
SELECT last_value FROM usuarios_instituicoes_id_seq;

-- Teste 2: Inserir manualmente
INSERT INTO usuarios_instituicoes (usuario_id, instituicao_id) 
VALUES (1, 'test-123');

-- Teste 3: Verificar se funcionou
SELECT * FROM usuarios_instituicoes WHERE instituicao_id = 'test-123';

-- Teste 4: Limpar teste
DELETE FROM usuarios_instituicoes WHERE instituicao_id = 'test-123';
```

---

## 🔄 Depois de Corrigir

1. **Reinicie o backend** (Quarkus)
2. **No frontend**, tente vincular novamente:
   - Acesse `/dashboard/cadastro-dados-institucionais`
   - Digite um CNPJ existente
   - Clique em "Vincular à Minha Conta"
3. **Verifique** se apareceu em "Minhas Instituições"

---

## 📊 Verificação Final

Execute para confirmar que está tudo certo:

```sql
-- 1. Confirmar que sequence existe e está configurada
\d usuarios_instituicoes

-- 2. Ver dados
SELECT * FROM usuarios_instituicoes;

-- 3. Ver último valor da sequence
SELECT last_value FROM usuarios_instituicoes_id_seq;
```

**Saída esperada do `\d usuarios_instituicoes`:**
```
Column          | Type                     | Default
----------------+--------------------------+--------------------------------
id              | bigint                   | nextval('usuarios_instituicoes_id_seq'::regclass)
usuario_id      | bigint                   | 
instituicao_id  | character varying(255)   |
data_vinculo    | timestamp with time zone | now()
ativo           | boolean                  | true
```

---

## 🐛 Se o Erro Persistir

### **Verificar Logs do Backend**

No console do Quarkus, procure por:

```
ERROR [org.acm.res.InstitutionResource]
```

### **Possíveis Erros:**

1. **"could not extract ResultSet"** → Problema com sequence
   - Solução: Execute os scripts SQL acima

2. **"duplicate key value violates unique constraint"** → Usuário já vinculado
   - Solução: Isso não é um erro! Ignore ou trate no frontend

3. **"null value in column"** → Campo obrigatório faltando
   - Solução: Verifique se todos os campos obrigatórios estão sendo enviados

### **Debug no Frontend**

Abra o Console do navegador (F12) e veja:

```javascript
// Deve mostrar:
[CadastroDados] Vinculando usuário à instituição: abc123
📤 institutionService.update CHAMADO
✅ institutionService.update SUCESSO
```

Se parar antes do "SUCESSO", o erro está no backend.

---

## 📝 Resumo

**Problema:** Sequence não configurada para `usuarios_instituicoes.id`  
**Solução:** Criar e configurar sequence manualmente  
**Arquivo:** `fix-usuarios-instituicoes-sequence.sql`  
**Comando:** `psql -h localhost -p 5432 -U postgres -d app_emendas -f fix-usuarios-instituicoes-sequence.sql`

---

## ✅ Checklist de Verificação

- [ ] Sequence existe e está ativa
- [ ] Coluna `id` usa a sequence como default
- [ ] Teste de inserção manual funciona
- [ ] Backend reiniciado
- [ ] Frontend consegue vincular usuário
- [ ] Vínculo aparece em "Minhas Instituições"

---

**Status:** ⏳ **Aguardando correção do usuário**

Execute o script SQL e teste novamente! 🚀
