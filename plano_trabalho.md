LEVANTAMENTO DE REQUISITOS

Módulo: Plano de Trabalho vinculado a instituição


1. Visão Geral

Módulo responsável por:

· Criar e gerenciar Planos de Trabalho

· Vincular plano a uma instituição

· Controlar metas, itens, cronogramas e valores

· Gerenciar aprovação

· Controlar prazos e prestação de contas

Escopo exclui modelagem de dados. Foco em regras, fluxos e comportamento do sistema.


2. Atores

2.1 Operador

· Vinculado a uma instituição

· Cria e edita plano de trabalho

· Documentos antes da aprovação (a definir)

· Anexa documentos após aprovação

· Responsável pela prestação de contas

2.2 Gestor

· Acessa todas as instituições e emendas

· Aprova ou desaprova plano


3. Entidades Lógicas

· Instituição (já possui dirigente cadastrado)

· Emenda (vinculada à instituição)

· Plano de Trabalho (1:1 com Emenda)

· O plano não precisa de uma emenda para existir, o plano é vinculado a instituição e pode ser vinculado uma emenda

· Meta (N:1 com Plano)

· Item (N:1 com Meta)

· Cronogramas

· Prestação de contas

· Documentos


4. Requisitos Funcionais

RF01 – Criar Plano de Trabalho

O operador deve poder criar um plano vinculado a uma emenda da sua instituição.

Regra:

· Cada emenda pode possuir apenas 1 plano de trabalho, se tiver emenda.

Validação:

· Impedir vinculo se já existir plano vinculado.

· Impedir vinculo se já existir uma instituição vinculada.


RF02 – Cadastro de Dados Cadastrais do plano

Campos obrigatórios:

· Nome do projeto

· Emenda vinculada

· Período de execução (data início e fim)

· Modalidade:

· Termo de Colaboração

· Termo de Fomento

· Dirigente da instituição (selecionado automaticamente)

· Conta bancária:

· Conta corrente

· Banco

· Agência


RF03 – Descrição do Objeto

Campos textos obrigatórios:

· Objeto da parceria

· Descrição da realidade

· Forma de execução


RF04 – Cadastro de Metas

· Permitir adicionar múltiplas metas.

· Nome automático sequencial:

· Meta 1

· Meta 2

· etc.

Cada meta deve conter:

· Descrição curta

· Pelo menos 1 item


RF05 – Cadastro de Itens

Cada item pertence a uma meta.

Campos obrigatórios:

· Tipo: Custeio ou Investimento

· Nome sequencial:

· Item 1

· Item 2

· Descrição

· Indicadores:

· Unidade

· Quantidade

· Data início

· Data fim

· Valor unitário

· Valor fornecedor 01

· Valor fornecedor 02

· Valor fornecedor 03

· ou mais, até 5

Regras:

· Valor total do item = quantidade × valor unitário

· Tipo é obrigatório (custeio ou investimento)

· Uma meta pode ter múltiplos itens


RF06 – Cronograma de Execução

Tabela automática derivada das metas e itens:

Exibe:

· Meta

· Item

· Período

· Valores

Somatórios automáticos.

Não editável diretamente.


RF07 – Previsão de Receitas e Despesas

Tabela com:

· Total geral do plano

· Total anual de receitas

· Total anual de despesas

Regras:

· Total geral do plano ≥ valor da emenda (validado na aprovação)


RF08 – Plano de Aplicação de Recursos

Tabela consolidada por meta:

Exibe:

· Meta

· Descrição do item

· Unidade

· Quantidade

· Valor unitário

· Valor total

· Fornecedor 01

· Fornecedor 02

· Fornecedor 03

Somatórios por meta e geral.


RF09 – Cronograma de Desembolso

Gerado automaticamente com base:

· Período do plano

· Valor total por meta

Exibe:

· Mês

· Valor por meta no mês

· Total mensal

· Total por meta

Regras:

· Se valor da emenda ≤ 100.000 → Parcela única obrigatória

· Se > 100.000 → Parcelas parciais permitidas


RF10 – Prazos

O sistema deve calcular automaticamente:

1. Parcela Única

Prazo:

· Até 90 dias após conclusão do cronograma físico

2. Parcelas Parciais

Prazo:

· Até 60 dias após cada repasse

3. Prestação de Contas Final

Prazo:

· Até 90 dias após término da parceria

O sistema deve:

· Notificar o operador antes do vencimento

· Exibir alerta visual

· Registrar data limite


RF11 – Aprovação

Fluxo:

1. Operador finaliza plano

2. Gestor avalia

3. Gestor:

· Aprova

· Desaprova (com justificativa)

Validações na aprovação:

· Total geral ≥ valor da emenda

· Pelo menos 1 meta

· Cada meta com pelo menos 1 item

· Todos os campos obrigatórios preenchidos


RF12 – Bloqueio Pós-Aprovação

Após status “Aprovado”:

· Impedir edição de qualquer campo estrutural

· Permitir apenas:

· Inclusão de documentos de prestação de contas


RF13 – Prestação de Contas

Disponível apenas após aprovação.

Permitir:

· Upload de documentos comprobatórios

· Registro de envio da prestação final

Sistema deve:

· Cobrar envio até 90 dias após término da parceria

· Notificar operador

· Mudar status automaticamente para "Fechado" após expiração


5. Estados do Plano

· Em elaboração

· Enviado para aprovação

· Aprovado

· Reprovado

· Em prestação de contas

· Fechado (automático após expiração do prazo final)


6. Regras de Negócio Consolidadas

1. Uma emenda → exatamente 1 plano.

2. Plano deve ter pelo menos 1 meta.

3. Meta deve ter pelo menos 1 item.

4. Item deve ser custeio ou investimento.

5. Total geral do plano ≥ valor da emenda.

6. Valor ≤ 100.000 → parcela única obrigatória.

7. Após aprovação → bloqueio estrutural.

8. Prestação final até 90 dias após término.

9. Após expiração → status = Fechado automático.

10. Sistema deve notificar prazos pendentes.


7. Casos de Uso

UC01 – Criar Plano

Ator: Operador Fluxo:

1. Seleciona emenda

2. Preenche dados cadastrais

3. Cadastra metas e itens

4. Salva rascunho


UC02 – Enviar para Aprovação

Ator: Operador Pré-condição:

· Plano completo

Fluxo:

1. Clica em enviar

2. Sistema valida regras

3. Muda status para “Enviado”


UC03 – Aprovar Plano

Ator: Gestor Fluxo:

1. Avalia plano

2. Valida total ≥ emenda

3. Aprova ou reprova

Pós-condição:

· Se aprovado → bloqueio estrutural


UC04 – Registrar Prestação de Contas

Ator: Operador Pré-condição:

· Plano aprovado

Fluxo:

1. Anexa documentos

2. Registra envio final


UC05 – Encerramento Automático

Sistema executa rotina diária:

1. Verifica prazos vencidos

2. Se prazo final ultrapassado → status = Fechado