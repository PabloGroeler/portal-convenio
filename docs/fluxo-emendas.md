# Fluxo de Tramitação das Emendas

Guia rápido para alinhar o ciclo de vida das emendas com os planos de trabalho. Abrange papéis, status, critérios de entrada/saída e diferenças entre execução Direta e Indireta.

## Papéis e responsabilidades (quem movimenta)
- **Orçamento**: triagem inicial, admissibilidade, viabilidade da demanda e ajustes de limites/dotação.
- **Secretaria**: recebe encaminhamento pós-admissibilidade (Direta) ou coordena retorno de pendências; acompanha demandas Diretas.
- **Convênios**: conduz análise documental e formalização quando a execução é Indireta.
- **Jurídico**: acionado para parecer em minutas/termos (quando aplicável).
- **Operador/Proponente**: envia detalhamento, documentos e atende pendências.

## Tipos de execução
- **Direta** (default se tipo não informado): após aprovação da demanda, não há etapa documental; segue para execução (Iniciado/Em execução/Concluído).
- **Indireta**: exige análise documental por Convênios antes de iniciar execução.

## Linha do tempo de status (ciclo de vida)
Fonte principal: `StatusCicloVidaEmenda` e `EmendaService.executarAcao`.

| Ordem | Status | Quem puxa | Entrada típica | Saída/Próxima ação | Observações |
| --- | --- | --- | --- | --- | --- |
| 1 | Recebido | Orçamento | Criação ou `SOLICITAR_APROVACAO` | Iniciar admissibilidade | Estado inicial default. |
| 2 | Em análise de admissibilidade | Orçamento | `INICIAR_ANALISE` | Aprovar ou reprovar admissibilidade | Encaminha secretariaDestino na aprovação. |
| 3 | Admissibilidade aprovada | Orçamento | `APROVAR_ADMISSIBILIDADE` | Secretaria assume (Direta) ou segue fluxo normal | Define `secretariaDestino`. |
| 3b | Devolvida ao legislativo | Orçamento | `REPROVAR_ADMISSIBILIDADE` | Fim do fluxo (pode reabrir via nova ação) | Justificativa necessária. |
| 4 | Em análise de demanda | Secretaria/Orçamento | `INICIAR_ANALISE_DEMANDA` | Aprovar ou reprovar demanda | Avalia viabilidade técnica/operacional. |
| 5 | Análise de demanda aprovada | Secretaria/Orçamento | `APROVAR_DEMANDA` | Direta: segue para execução; Indireta: vai para Convênios (documental) | Roteamento depende do `tipoTransferencia`. |
| 5b | Devolvida por incompatibilidade de demanda | Secretaria/Orçamento | `REPROVAR_DEMANDA` | Retorna a Orçamento para ajustes | Justificar pontos não atendidos. |
| 6 (Indireta) | Em análise documental | Convênios | `INICIAR_ANALISE_DOCUMENTAL` | Aprovar ou reprovar documental | Só permitido se tipo = Indireta. |
| 7 (Indireta) | Análise documental aprovada | Convênios | `APROVAR_DOCUMENTAL` | Segue para Iniciado/Execução | Permite formalização/termo. |
| 7b (Indireta) | Devolvida por inviabilidade documental | Convênios | `REPROVAR_DOCUMENTAL` | Retorna a Orçamento/Secretaria com ajustes | Justificar documentos faltantes. |
| 8 | Iniciado | Convênios (Indireta) ou Secretaria (Direta) | `AGUARDAR_DETALHAMENTO` ou pós-documental | Em execução | Sinaliza empenho/ordem de início. |
| 9 | Em execução | Execução financeira | Liquidação em andamento | Concluído ao fim do pagamento | Definido por eventos financeiros (liquidação/pagamento). |
| 10 | Concluído | Execução financeira | Pagamento total | Fim de ciclo | Pode exigir prestação de contas. |
| -- | Devolvido | Qualquer área | `DEVOLVER` ou `REPROVAR` genérico | Reabre para ajustes | Usado como retorno genérico fora das ações específicas acima. |

## Ações do sistema (API `executarAcao`)
- `SOLICITAR_APROVACAO` -> Recebido
- `INICIAR_ANALISE` -> Em análise de admissibilidade
- `APROVAR_ADMISSIBILIDADE` -> Admissibilidade aprovada (seta `secretariaDestino`)
- `REPROVAR_ADMISSIBILIDADE` -> Devolvida ao legislativo
- `INICIAR_ANALISE_DEMANDA` -> Em análise de demanda
- `APROVAR_DEMANDA` -> Análise de demanda aprovada (Direta: segue execução; Indireta: Convênios/documental)
- `REPROVAR_DEMANDA` -> Devolvida por incompatibilidade de demanda
- `INICIAR_ANALISE_DOCUMENTAL` -> Em análise documental (somente Indireta)
- `APROVAR_DOCUMENTAL` -> Análise documental aprovada (somente Indireta)
- `REPROVAR_DOCUMENTAL` -> Devolvida por inviabilidade documental (somente Indireta)
- `AGUARDAR_DETALHAMENTO` -> Iniciado
- `APROVAR` -> Concluído
- `DEVOLVER` ou `REPROVAR` -> Devolvido

## Roteamento por papel (visibilidade)
Regras em `EmendaService.listWithDetailsForUser`:
- **SECRETARIA**: não vê "Análise de demanda aprovada" quando a emenda é Indireta (nesses casos o dono é Convênios); filtra apenas a própria `secretariaDestino`.
- **CONVENIOS**: não vê "Análise de demanda aprovada" quando a emenda é Direta.
- **ADMIN / ORCAMENTO**: vê tudo.

## Artefatos sugeridos por etapa
- Admissibilidade: parecer técnico/orçamentário, apontamento de incompatibilidade (se houver).
- Demanda: justificativa de viabilidade, requisitos operacionais/territoriais.
- Documental (Indireta): checklist de documentos do termo/convênio, comprovações da OSC.
- Iniciado/Execução: ordem de início, empenho, medições/liquidações.
- Concluído: comprovantes de pagamento, encerramento e, se aplicável, prestação de contas.

## Notas rápidas
- Status são normalizados; valores livres devem ser convertidos via `StatusCicloVidaEmendaService.normalize`.
- Para Direta, ações documentais são bloqueadas pelo backend.
- Histórico registra todas ações (`EmendaHistorico`), útil para trilha de auditoria e SLA.

