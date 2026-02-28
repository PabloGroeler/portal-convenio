---
id: task-28
title: "\U0001F9E9 User Story — Criação do Dashboard do Gestor"
status: To Do
assignee: []
created_date: '2026-02-28 00:44'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Criação do Dashboard para perfis de Gestão

Como usuário com perfil de Gestor, Analista, Jurídico ou Orçamento,
Quero acessar um dashboard específico de gestão,
Para que eu visualize informações e funcionalidades adequadas ao meu papel dentro do sistema.

📌 Contexto

Atualmente o sistema possui os seguintes perfis:

ADMIN

OPERADOR ✅ (já possui dashboard próprio)

GESTOR

ANALISTA

JURIDICO

ORCAMENTO

O dashboard existente atende exclusivamente ao perfil OPERADOR.

Será necessário criar um novo dashboard de Gestão, que será compartilhado inicialmente entre os perfis:

GESTOR

ANALISTA

JURIDICO

ORCAMENTO

Posteriormente serão implementadas regras específicas de visualização e funcionalidades por perfil.

✅ Critérios de Aceite
🎯 Acesso

 Usuários com perfil GESTOR, ANALISTA, JURIDICO ou ORCAMENTO devem acessar o novo dashboard.

 Usuários OPERADOR continuam acessando o dashboard atual.

 ADMIN deve manter acesso conforme regra já existente.

🎯 Estrutura Inicial

 Criar novo layout/base do dashboard de gestão.

 Dashboard deve ser independente do dashboard do OPERADOR.

 Estrutura preparada para futura personalização por perfil.

🎯 Preparação para Regras Futuras

 O sistema deve identificar o perfil logado.

 A arquitetura deve permitir exibição condicional de componentes/widgets.

 Deve ser possível habilitar/desabilitar funcionalidades por perfil sem refatoração estrutural.

🚧 Fora do Escopo (Neste Momento)

Regras específicas por perfil.

Diferença visual entre Gestor, Analista, Jurídico e Orçamento.

Permissões detalhadas de ação.

(Esses itens serão tratados em stories futuras.)

🏗️ Considerações Técnicas

Implementar controle baseado em Role/Profile.

Evitar duplicação de dashboards.

Utilizar abordagem configurável (feature flags / permission-based rendering).

Garantir reutilização de componentes.
<!-- SECTION:DESCRIPTION:END -->
