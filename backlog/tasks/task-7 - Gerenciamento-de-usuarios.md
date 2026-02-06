---
id: task-7
title: Gerenciamento de usuarios
status: Done
assignee: []
created_date: '2026-01-30 15:07'
updated_date: '2026-02-06 19:14'
labels: []
dependencies: []
ordinal: 6000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
1. REQUISITOS FUNCIONAIS DETALHADOS
RF-01 – Gestão de Usuários e Controle de Acesso

O sistema deve prover mecanismos para criação, manutenção e controle de acesso de usuários, garantindo segurança, rastreabilidade e conformidade com regras de negócio e validações obrigatórias.

RF-01.1 – Cadastro de Usuários

O sistema deve permitir o cadastro, visualização, edição e gerenciamento de usuários, contemplando os seguintes campos obrigatórios e opcionais:

📋 Dados do Usuário

Nome completo (obrigatório)

CPF (obrigatório, com validação de formato e dígitos verificadores)

E-mail (obrigatório, com validação de formato e unicidade no sistema)

Telefone/Celular (opcional, com validação de formato)

Cargo/Função (opcional)

Status do usuário (obrigatório):

Ativo

Inativo

Bloqueado

Data de criação (gerada automaticamente pelo sistema)

Data da última alteração (atualizada automaticamente a cada modificação)

🔐 Regras de Negócio – Cadastro

Não deve ser permitido o cadastro de usuários com CPF ou e-mail duplicados.

Campos obrigatórios devem ser validados antes da persistência dos dados.

O sistema deve registrar automaticamente as datas de criação e atualização.

Usuários com status Inativo ou Bloqueado não devem conseguir acessar o sistema.

RF-01.2 – Portal de Auto-Cadastro (Operadores)

O sistema deve disponibilizar uma interface pública de auto-cadastro, denominada “Portal do Operador”, destinada ao cadastramento simplificado de usuários do tipo Operador.

🧾 Dados exigidos no Auto-Cadastro

O usuário deverá informar obrigatoriamente:

Nome completo

E-mail (válido e único)

Senha, conforme política de segurança definida pelo sistema

⚙️ Comportamento do Sistema no Auto-Cadastro

Ao concluir o auto-cadastro com sucesso, o sistema deve:

Criar automaticamente o usuário

Atribuir o perfil “Operador”

Definir o status inicial como “Ativo”

O usuário criado via auto-cadastro deve possuir apenas as permissões associadas ao perfil Operador.

O e-mail informado não pode estar previamente cadastrado no sistema.

🔒 Regras de Segurança

A senha informada deve atender aos critérios mínimos de segurança (ex: tamanho mínimo, complexidade).

As senhas devem ser armazenadas de forma segura, utilizando criptografia/hash.

O sistema deve impedir tentativas de cadastro com dados inválidos ou inconsistentes.

🧩 Observações Gerais

O cadastro administrativo e o auto-cadastro devem seguir as mesmas regras de unicidade e validação.

O Portal do Operador deve ser desacoplado da área autenticada do sistema.

O sistema deve estar preparado para futura inclusão de fluxos como:

Aprovação manual de cadastros

Confirmação de e-mail

Recuperação de senha
<!-- SECTION:DESCRIPTION:END -->
