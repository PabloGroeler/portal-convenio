---
id: task-11
title: RF-02.3 - Status da OSC
status: Done
assignee: []
created_date: '2026-02-06 19:13'
updated_date: '2026-02-06 19:14'
completed_date: '2026-02-06'
labels: [status-control, automation, frontend]
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
RF-02.3 - Status da OSC O sistema deve controlar os seguintes status estritos: EM_CADASTRO: Status inicial quando o cadastro é criado, antes da inserção de documentos. DOCUMENTOS_INCOMPLETOS: Status automático acionado assim que o primeiro documento é adicionado, indicando processo de upload em andamento. EM_ANÁLISE: Status automático acionado apenas após a inclusão de todos os documentos obrigatórios. Neste momento, o cadastro torna-se visível para o Analista. APROVADO: Cadastro validado e aprovado pelo Analista ou Administrador. REPROVADO: Acionado se o Analista ou Administrador rejeitar algum documento ou dado. Retorna para o Operador. SUSPENSA: Cadastro temporariamente suspenso (com justificativa obrigatória). INATIVA: OSC desativada
<!-- SECTION:DESCRIPTION:END -->
