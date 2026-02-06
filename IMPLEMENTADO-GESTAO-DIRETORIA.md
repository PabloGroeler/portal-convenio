# ✅ IMPLEMENTADO - Gestão de Diretoria (Task-11 / RF-03)

## 🎯 O Que Foi Implementado

Sistema completo de gestão de diretoria para instituições (OSC), permitindo cadastro e gerenciamento de dirigentes com todas as validações de negócio especificadas.

---

## 📊 Estrutura Completa

### Backend (Java + Quarkus)

#### 1. Entidade: `Dirigente.java` ✅

**Localização:** `src/main/java/org/acme/entity/Dirigente.java`

**Campos implementados:**
- **ID:** UUID gerado automaticamente
- **Vínculo:** `instituicaoId` (chave estrangeira)
- **Dados Pessoais:** Nome completo, nome social, CPF, RG, órgão expedidor, UF, datas, sexo, nacionalidade, estado civil
- **Cargo:** Cargo, datas início/término, status (Ativo/Inativo), motivo inativação
- **Contato:** Telefone, celular, e-mail
- **Endereço:** CEP, logradouro, número, complemento, bairro, cidade, UF
- **Auditoria:** Data criação, data atualização

**Constraints:**
- CPF único
- Obrigatoriedade de campos críticos
- Índices para performance

#### 2. Repository: `DirigenteRepository.java` ✅

**Métodos:**
- `findByInstituicao()` - Lista todos os dirigentes de uma instituição
- `findAtivosByInstituicao()` - Lista apenas dirigentes ativos
- `findByCpf()` - Busca por CPF (validação de unicidade)
- `findByCargoAtivoInInstituicao()` - Busca por cargo específico ativo
- `countCargoAtivoInInstituicao()` - Conta cargos ativos (validação de regras)

#### 3. Service: `DirigenteService.java` ✅

**Regras de Negócio Implementadas (RF-03.2):**

✅ **CPF Único**
- Valida que não existe outro dirigente com o mesmo CPF
- Verifica também na atualização (exceto o próprio)

✅ **Presidente Único Ativo**
- Apenas 1 presidente ativo por instituição
- Validado na criação e atualização

✅ **Tesoureiro Único Ativo**
- Apenas 1 tesoureiro ativo por instituição
- Validado na criação e atualização

✅ **Vice-Presidente e Secretário**
- Podem ter múltiplos ativos (regra permitida)

✅ **Inativação Obrigatória**
- Data de término obrigatória
- Motivo obrigatório
- Campos validados antes de inativar

**Métodos do Service:**
- `criarDirigente()` - Cria com todas as validações
- `atualizarDirigente()` - Atualiza com validações
- `inativarDirigente()` - Inativa com data e motivo
- `listarPorInstituicao()` - Lista todos
- `listarAtivosPorInstituicao()` - Lista apenas ativos
- `buscarPorId()` - Busca individual
- `verificarCargosObrigatorios()` - Retorna avisos sobre presidente/tesoureiro ausentes

#### 4. Resource (REST): `DirigenteResource.java` ✅

**Endpoints:**

| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/api/dirigentes` | Criar dirigente |
| GET | `/api/dirigentes/instituicao/{id}` | Listar (query: apenasAtivos) |
| GET | `/api/dirigentes/{id}` | Buscar por ID |
| PUT | `/api/dirigentes/{id}` | Atualizar |
| POST | `/api/dirigentes/{id}/inativar` | Inativar |
| GET | `/api/dirigentes/instituicao/{id}/avisos` | Verificar cargos obrigatórios |

#### 5. Migration: `V7__create_dirigentes_table.sql` ✅

**SQL para criar tabela:**
- Todos os campos especificados
- Foreign key para `instituicoes`
- Índices para performance (cpf, instituicaoId, cargo+status)
- Constraint de CPF único

---

### Frontend (React + TypeScript)

#### 1. Types: `dirigente.types.ts` ✅

**Interface Dirigente** com todos os campos

**Constantes:**
- `SEXO_OPTIONS` = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar']
- `ESTADO_CIVIL_OPTIONS` = ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']
- `CARGO_OPTIONS` = ['Presidente', 'Vice-Presidente', 'Secretário', 'Tesoureiro', 'Conselheiro Fiscal', 'Outro']
- `UF_OPTIONS` = [Todas as 27 UFs]

#### 2. Service: `dirigenteService.ts` ✅

**Funções:**
- `criar()` - POST /api/dirigentes
- `listar()` - GET /api/dirigentes/instituicao/{id}
- `buscarPorId()` - GET /api/dirigentes/{id}
- `atualizar()` - PUT /api/dirigentes/{id}
- `inativar()` - POST /api/dirigentes/{id}/inativar
- `verificarAvisos()` - GET /api/dirigentes/instituicao/{id}/avisos

#### 3. Página: `DiretoriaPage.tsx` ✅

**Funcionalidades:**

✅ **Lista de Dirigentes**
- Grid responsivo (1/2/3 colunas)
- Cards com informações principais
- Badge de status (Ativo/Inativo)
- Filtro "Apenas Ativos"
- Botões de ação por card

✅ **Avisos de Cargos Obrigatórios**
- Alerta amarelo se falta Presidente ou Tesoureiro
- Lista os cargos ausentes
- Atualiza automaticamente

✅ **Modal de Cadastro/Edição**
- Formulário completo em seções:
  - 📋 Dados Pessoais (azul)
  - 💼 Cargo (roxo)
  - 📞 Contato (verde)
  - 📍 Endereço (laranja)
- Validações client-side
- Formatação automática (CPF, CEP, telefone)
- Campos obrigatórios marcados com *
- Dropdowns para seleções

✅ **Modal de Inativação**
- Data de término obrigatória
- Motivo obrigatório (textarea)
- Confirmação visual

✅ **Formatações Automáticas**
- CPF: 000.000.000-00
- CEP: 00000-000
- Telefone: (00) 00000-0000

#### 4. Integração: Botão em `CadastroDadosInstitucionaisPage.tsx` ✅

**Botão "Gerenciar Diretoria"** adicionado:
- Aparece apenas no modo de edição (quando tem ID)
- Cor roxa para destaque
- Ícone de pessoas
- Redireciona para: `/dashboard/diretoria?instituicaoId={id}`

#### 5. Roteamento: `App.tsx` ✅

**Rota adicionada:**
```tsx
<Route path="diretoria" element={<DiretoriaPage />} />
```

---

## 🎨 Visual da Interface

### Lista de Dirigentes:

```
┌─────────────────────────────────────┐
│ ⚠️ AVISO: Presidente não cadastrado │
│ ⚠️ AVISO: Tesoureiro não cadastrado │
└─────────────────────────────────────┘

☑ Mostrar apenas ativos

┌──────────────┬──────────────┬──────────────┐
│ João Silva   │ Maria Santos │ Pedro Costa  │
│ Presidente   │ Tesoureira   │ Secretário   │
│ [Ativo]      │ [Ativo]      │ [Inativo]    │
│ ✉️ email...  │ ✉️ email...  │ ✉️ email...  │
│ ☎ telefone   │ ☎ telefone   │ ☎ telefone   │
│ [Editar]     │ [Editar]     │ [Editar]     │
│ [Inativar]   │ [Inativar]   │              │
└──────────────┴──────────────┴──────────────┘
```

### Modal de Cadastro:

```
┌─ Novo Dirigente ────────────────────┐
│                                  [X] │
├─────────────────────────────────────┤
│ 📋 Dados Pessoais                   │
│ • Nome Completo *                   │
│ • Nome Social                       │
│ • CPF * | RG *                      │
│ • Órgão | UF *                      │
│ • Data Expedição * | Nascimento *   │
│ • Sexo * | Nacionalidade *          │
│ • Estado Civil *                    │
│                                     │
│ 💼 Cargo                            │
│ • Cargo * | Data Início *           │
│                                     │
│ 📞 Contato                          │
│ • Telefone * | Celular              │
│ • E-mail *                          │
│                                     │
│ 📍 Endereço                         │
│ • CEP * | Logradouro *              │
│ • Número * | Complemento            │
│ • Bairro * | Cidade * | UF *        │
├─────────────────────────────────────┤
│            [Cancelar] [Cadastrar]   │
└─────────────────────────────────────┘
```

---

## 🔄 Fluxo Completo de Uso

### 1. Acesso à Gestão de Diretoria

```
Dashboard → Instituições → [Editar Instituição]
   ↓
Cadastro de Dados Institucionais
   ↓
[Gerenciar Diretoria] ← Botão roxo no canto inferior esquerdo
   ↓
Página de Gestão de Diretoria
```

### 2. Cadastrar Novo Dirigente

```
1. Click em [+ Novo Dirigente]
2. Preencher formulário (4 seções)
3. [Cadastrar]
4. Backend valida:
   - CPF único ✓
   - Presidente único (se cargo = Presidente) ✓
   - Tesoureiro único (se cargo = Tesoureiro) ✓
5. Sucesso: Dirigente cadastrado
6. Lista atualiza automaticamente
7. Avisos atualizam se cargos foram preenchidos
```

### 3. Inativar Dirigente

```
1. Click em [Inativar] no card
2. Modal abre
3. Informar:
   - Data de término *
   - Motivo *
4. [Inativar]
5. Dirigente passa para status "Inativo"
6. Lista atualiza
7. Avisos atualizam se era Presidente/Tesoureiro
```

---

## 📊 Regras de Negócio Implementadas

| Regra | Status | Implementação |
|-------|--------|---------------|
| RF-03.1: Campos obrigatórios | ✅ | Required no form + validação backend |
| RF-03.2: CPF único | ✅ | Index único + validação no service |
| RF-03.2: Presidente único ativo | ✅ | Query count no service |
| RF-03.2: Tesoureiro único ativo | ✅ | Query count no service |
| RF-03.2: Vice-Presidente múltiplo | ✅ | Permitido (sem validação) |
| RF-03.2: Secretário múltiplo | ✅ | Permitido (sem validação) |
| RF-03.2: Inativação com data | ✅ | Validação obrigatória |
| RF-03.2: Inativação com motivo | ✅ | Validação obrigatória |
| RF-03.3: Avisos de cargos | ✅ | Endpoint + alerta visual |

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `dirigentes`

```sql
CREATE TABLE dirigentes (
    id VARCHAR(36) PRIMARY KEY,
    id_instituicao VARCHAR(100) NOT NULL,
    
    -- Dados Pessoais
    nome_completo VARCHAR(200) NOT NULL,
    nome_social VARCHAR(200),
    cpf VARCHAR(11) NOT NULL UNIQUE,
    rg VARCHAR(20) NOT NULL,
    orgao_expedidor VARCHAR(20) NOT NULL,
    uf_orgao_expedidor VARCHAR(2) NOT NULL,
    data_expedicao DATE NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo VARCHAR(50) NOT NULL,
    nacionalidade VARCHAR(100) NOT NULL,
    estado_civil VARCHAR(50) NOT NULL,
    
    -- Cargo
    cargo VARCHAR(100) NOT NULL,
    data_inicio_cargo DATE NOT NULL,
    data_termino_cargo DATE,
    status_cargo VARCHAR(20) NOT NULL DEFAULT 'Ativo',
    motivo_inativacao VARCHAR(500),
    
    -- Contato
    telefone VARCHAR(20) NOT NULL,
    celular VARCHAR(20),
    email VARCHAR(200) NOT NULL,
    
    -- Endereço
    cep VARCHAR(8) NOT NULL,
    logradouro VARCHAR(200) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf VARCHAR(2) NOT NULL,
    
    -- Auditoria
    data_criacao TIMESTAMP WITH TIME ZONE,
    data_atualizacao TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_dirigente_instituicao 
        FOREIGN KEY (id_instituicao) 
        REFERENCES instituicoes(id_instituicao)
);

-- Índices
CREATE INDEX idx_dirigentes_instituicao ON dirigentes(id_instituicao);
CREATE UNIQUE INDEX idx_dirigentes_cpf ON dirigentes(cpf);
CREATE INDEX idx_dirigentes_cargo_status ON dirigentes(cargo, status_cargo);
```

---

## 📁 Arquivos Criados/Modificados

### Backend (Java)

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `Dirigente.java` | ✅ NEW | Entidade JPA |
| `DirigenteRepository.java` | ✅ NEW | Panache Repository |
| `DirigenteDTO.java` | ✅ NEW | Data Transfer Object |
| `DirigenteService.java` | ✅ NEW | Lógica de negócio |
| `DirigenteResource.java` | ✅ NEW | REST endpoints |
| `V7__create_dirigentes_table.sql` | ✅ NEW | Migration Flyway |

### Frontend (TypeScript/React)

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `dirigente.types.ts` | ✅ NEW | Interfaces e constantes |
| `dirigenteService.ts` | ✅ NEW | API client |
| `DiretoriaPage.tsx` | ✅ NEW | Página completa |
| `App.tsx` | ✅ MODIFIED | Rota adicionada |
| `CadastroDadosInstitucionaisPage.tsx` | ✅ MODIFIED | Botão adicionado |

---

## 🧪 Como Testar

### 1. Reiniciar Backend (OBRIGATÓRIO!)

```bash
docker-compose down
docker-compose up --build
```

**O que acontece:**
- Flyway executa migration V7 (cria tabela `dirigentes`)
- Constraints e índices são criados
- Backend recompila com novas classes

### 2. Acessar Frontend

```
http://localhost:3000/dashboard
```

### 3. Navegar para Gestão de Diretoria

```
Dashboard 
  → Minhas Instituições 
  → [Visualizar Detalhes] em qualquer instituição
  → [Gerenciar Diretoria] (botão roxo no rodapé)
```

### 4. Testar Funcionalidades

#### ✅ Teste 1: Cadastrar Presidente
1. Click [+ Novo Dirigente]
2. Preencher todos os campos obrigatórios
3. Cargo: **Presidente**
4. [Cadastrar]
5. **Resultado:** Sucesso, aviso amarelo de tesoureiro ausente desaparece

#### ✅ Teste 2: Validação Presidente Único
1. Tentar cadastrar outro Presidente
2. **Resultado:** Erro "Já existe um Presidente ativo para esta instituição"

#### ✅ Teste 3: Cadastrar Tesoureiro
1. Cadastrar com cargo: **Tesoureiro**
2. **Resultado:** Sucesso, todos os avisos desaparecem

#### ✅ Teste 4: Validação CPF Único
1. Tentar cadastrar com CPF já existente
2. **Resultado:** Erro "CPF já cadastrado no sistema"

#### ✅ Teste 5: Inativar Dirigente
1. Click [Inativar] em um card
2. Informar data e motivo
3. [Inativar]
4. **Resultado:** Status muda para "Inativo", botão [Inativar] desaparece

#### ✅ Teste 6: Filtro Apenas Ativos
1. Marcar checkbox "Mostrar apenas ativos"
2. **Resultado:** Dirigentes inativos desaparecem da lista

#### ✅ Teste 7: Editar Dirigente
1. Click [Editar]
2. Modificar dados
3. [Atualizar]
4. **Resultado:** Dados atualizados

---

## 🎯 Endpoints da API

### Criar Dirigente

```bash
POST /api/dirigentes
Content-Type: application/json

{
  "instituicaoId": "inst-123",
  "nomeCompleto": "João da Silva",
  "cpf": "12345678900",
  "rg": "1234567",
  "orgaoExpedidor": "SSP",
  "ufOrgaoExpedidor": "MT",
  "dataExpedicao": "2010-01-15",
  "dataNascimento": "1980-05-20",
  "sexo": "Masculino",
  "nacionalidade": "Brasileira",
  "estadoCivil": "Casado",
  "cargo": "Presidente",
  "dataInicioCargo": "2026-01-01",
  "statusCargo": "Ativo",
  "telefone": "65999887766",
  "email": "joao@test.com",
  "cep": "78000000",
  "logradouro": "Rua Teste",
  "numero": "123",
  "bairro": "Centro",
  "cidade": "Sinop",
  "uf": "MT"
}
```

### Listar Dirigentes

```bash
# Todos
GET /api/dirigentes/instituicao/inst-123

# Apenas ativos
GET /api/dirigentes/instituicao/inst-123?apenasAtivos=true
```

### Buscar por ID

```bash
GET /api/dirigentes/{id}
```

### Atualizar

```bash
PUT /api/dirigentes/{id}
Content-Type: application/json

{ ...dados atualizados... }
```

### Inativar

```bash
POST /api/dirigentes/{id}/inativar
Content-Type: application/json

{
  "dataTermino": "2026-12-31",
  "motivo": "Término do mandato"
}
```

### Verificar Avisos

```bash
GET /api/dirigentes/instituicao/inst-123/avisos

# Response:
{
  "avisos": [
    "A instituição não possui um Presidente ativo",
    "A instituição não possui um Tesoureiro ativo"
  ],
  "temAvisos": true
}
```

---

## ✅ Resultado Final

**Sistema completo de gestão de diretoria implementado!**

✅ **Backend:**
- Entidade, Repository, Service, Resource
- Todas as regras de negócio (RF-03.2)
- Migration SQL
- Validações robustas

✅ **Frontend:**
- Página completa com lista
- Modais de cadastro/edição
- Modal de inativação
- Avisos visuais
- Formatações automáticas
- Integração com cadastro de instituição

✅ **Banco de Dados:**
- Tabela `dirigentes` criada
- Foreign keys
- Índices para performance
- Constraints de unicidade

✅ **Funcionalidades:**
- CRUD completo
- Validação de cargos únicos
- Inativação com histórico
- Filtros
- Avisos de cargos ausentes

---

**🎉 IMPLEMENTAÇÃO 100% COMPLETA! 🎉**

**Basta reiniciar o backend e acessar via Dashboard → Instituições → [Gerenciar Diretoria]**

Data: 2026-02-06

