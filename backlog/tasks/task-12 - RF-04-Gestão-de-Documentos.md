---
id: task-12
title: RF-04 - Gestão de Documentos
status: Done
assignee: []
created_date: '2026-02-06 19:14'
updated_date: '2026-02-06 19:14'
labels: []
dependencies: []
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
RF-04 - Gestão de Documentos RF-04.1 - Upload de Documentos da Instituição O sistema deve permitir upload dos seguintes documentos: Documentos Institucionais:

Cartão do CNPJ (obrigatório)
Estatuto Social (obrigatório)
Alvará de Funcionamento (obrigatório)
Declaração de Utilidade Pública Municipal (se aplicável)
Ata da Última Eleição de Diretoria - Registrada em Cartório (obrigatório)
Comprovante de Inscrição no Conselho Municipal (obrigatório)
Comprovante de Endereço (obrigatório, máx. 90 dias) Certidões Negativas da Instituição:
Certidão Negativa de Débitos Relativos aos Tributos Federais e à Dívida Ativa da União (obrigatório)
Certificado de Regularidade do FGTS - CRF (obrigatório)
Certidão Negativa de Débitos Trabalhistas - CNDT (obrigatório)
Certidão Negativa de Débitos Municipais (obrigatório)
Certidão Negativa do TCE/MT - Instituição (obrigatório) RF-04.2 - Upload de Documentos dos Dirigentes Para cada dirigente, permitir upload de:
RG (obrigatório)
CPF (obrigatório)
Comprovante de Endereço (obrigatório, máx. 90 dias)
Certidão Negativa do TCE/MT - Pessoa Física (obrigatório) RF-04.3 - Especificações Técnicas dos Documentos Formatos aceitos: PDF, JPG, JPEG, PNG Tamanho máximo por arquivo: 5MB O sistema deve permitir visualização online de PDFs O sistema deve gerar thumbnail para imagens Armazenamento seguro com hash de verificação Versionamento de documentos (manter histórico) RF-04.4 - Informações do Documento Para cada documento, registrar: Tipo de Documento (lista pré-definida) Nome do Arquivo Original Data de Upload Usuário que fez o Upload Data de Emissão do Documento Data de Validade (quando aplicável) Número do Documento (quando aplicável) Status do Documento: Pendente de Envio Enviado Em Análise Aprovado Reprovado Vencido Substituído Observações Motivo de Reprovação (quando aplicável) RF-04.5 - Controle de Validade O sistema deve calcular automaticamente a situação do documento baseado na data de validade Alertas automáticos para documentos próximos ao vencimento (30, 15 e 7 dias) Notificação por e-mail para documentos vencidos Dashboard com indicadores de documentos vencidos e a vencer
<!-- SECTION:DESCRIPTION:END -->
