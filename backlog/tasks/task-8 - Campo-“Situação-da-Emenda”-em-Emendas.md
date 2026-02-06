---
id: task-8
title: Campo “Situação da Emenda” em Emendas
status: Done
assignee: []
created_date: '2026-01-30 18:25'
updated_date: '2026-02-06 19:14'
labels: []
dependencies: []
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Como usuário do sistema,
quero selecionar a Situação da Emenda durante o cadastro,
para identificar corretamente o estágio atual da emenda no seu ciclo de vida.

🧾 Especificação do Campo

Nome do campo: Situação da Emenda

Tipo: Menu de seleção (select)

Obrigatoriedade: Campo obrigatório

Valores permitidos:

Recebido

Iniciado

Em execução

Concluído

Devolvido
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 O campo Situação da Emenda deve ser exibido na tela de cadastro de emendas.
- [ ] #2 O campo deve ser do tipo select, não permitindo valores livres.
- [ ] #3 Apenas os valores pré-definidos devem estar disponíveis para seleção.
- [ ] #4 O sistema deve impedir o salvamento da emenda caso o campo não seja preenchido.
- [ ] #5 O valor selecionado deve ser persistido corretamente no banco de dados.
- [ ] #6 O sistema deve exibir mensagem de erro clara caso o campo não seja informado.
<!-- AC:END -->
