---
id: task-10
title: Ajuste nas validações na criação de emendas
status: Done
assignee: []
created_date: '2026-01-31 18:55'
completed_date: '2026-01-31'
labels: [validation, backend, frontend]
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cadastro emenda:
• Autor/Emenda: Deve conter um campo para selecionar o objeto principal(Cadastro 
parlamentar)
• Número de Emenda: deve armazenar um número inteiro como um identificador 
único da emeda. Este número devera fazer parte da chave composta da tabela 
junto com o campo de exercício, ou seja, esse número deve ser único em cada 
exercício.
Validação: deve aceitar apenas valores > 0 (maior que zero), e únicos. 
(Observação, este campo será preenchido pelo usuário).
• Valor da Emenda: deve conter um campo para armazenar valores flutuantes com 
2 casas decimais;
Validação: Deverá aceitar apenas valores > R$ 0,00.(maior que zero).
• Objeto da Emenda: deve conter um campo para inserir um texto, tamanho 
máximo de 250 caracteres;
• Situação da Emenda: Deve conter um menu select com os valores: Recebido, 
Iniciado, Em execução, Concluído e Devolvido;
• Previsão de conclusão: deve conter um campo para inserir uma data com dia, 
mês e ano.
• Justificativa: deve conter um campo para inserir um texto, com tamanho máximo 
de 250 caracteres;
Validação: deve conter no mínimo 20 caractere
<!-- SECTION:DESCRIPTION:END -->
