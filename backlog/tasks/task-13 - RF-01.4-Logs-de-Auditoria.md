---
id: task-13
title: RF-01.4 - Logs de Auditoria
status: Done
assignee: []
created_date: '2026-02-16 20:17'
completed_date: '2026-02-16 22:30'
labels: [backend, security, audit]
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
✅ **IMPLEMENTADO**

O sistema registra automaticamente:
- ✅ Todas as operações de login e logout
- ✅ Tentativas de acesso negadas
- ✅ Criação, edição e exclusão de registros
- ✅ Upload, substituição e exclusão de documentos
- ✅ Alterações de status
- ✅ Exportação de dados
- ✅ Consultas realizadas
- ✅ Alterações de permissões

Para cada registro de log, captura:
- ✅ Data e hora (timestamp)
- ✅ Usuário responsável (ID e nome)
- ✅ IP de origem
- ✅ Ação realizada
- ✅ Tabela/Entidade afetada
- ✅ ID do registro afetado
- ✅ Valores anteriores (para updates)
- ✅ Valores novos (para updates e inserts)
- ✅ Resultado da operação (sucesso/falha)

## Implementação

**Arquivos Criados:**
- `src/main/java/org/acme/entity/AuditLog.java` - Entidade
- `src/main/java/org/acme/service/AuditService.java` - Serviço
- `src/main/resources/db/migration/V18__create_audit_logs_table.sql` - Migration

**Tabela:** `logs_auditoria`

**Métodos Disponíveis:**
- `logLogin()` - Registra login/falha
- `logLogout()` - Registra logout
- `logCreate()` - Registra criação
- `logUpdate()` - Registra atualização (before/after)
- `logDelete()` - Registra exclusão
- `logUpload()` - Registra upload
- `logAcessoNegado()` - Registra acesso negado

**Próximos Passos:**
- [ ] Integrar nos Resources (EmendasResource, InstitutionResource, etc.)
- [ ] Criar endpoint de consulta de logs (admin)
- [ ] Criar tela frontend de auditoria
<!-- SECTION:DESCRIPTION:END -->
