---
id: task-14
title: "\U0001F4D8 User Story — Integração Object Storage (MinIO)"
status: In Progress
assignee: []
created_date: '2026-02-21 16:00'
updated_date: '2026-02-23 20:05'
labels: []
dependencies: []
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Como

Desenvolvedor backend da plataforma

Quero

armazenar e recuperar arquivos utilizando um object storage compatível com S3 através do MinIO

Para

permitir upload, download e gerenciamento de arquivos de forma escalável, desacoplada e compatível com futura integração AWS S3.

✅ Descrição

A aplicação atualmente recebe arquivos enviados pelo frontend e necessita persistir esses arquivos em um armazenamento externo escalável.

Será implementada a integração com o MinIO executando em ambiente local/containerizado, utilizando API compatível com Amazon S3, permitindo:

Upload de arquivos

Download seguro de arquivos

Geração de URLs temporárias (Presigned URLs)

Separação entre metadados (PostgreSQL) e conteúdo binário (Object Storage)

A solução deve permitir futura migração transparente para AWS S3.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
🧱 Tasks Técnicas
Backend

 Criar cliente S3 compatível

 Implementar FileStorageService

 Implementar geração Presigned URL

 Persistir metadata do arquivo

 Tratamento de exceções

Infra

 Criar docker-compose MinIO

 Criar bucket inicial

 Configurar variáveis ambiente
<!-- SECTION:PLAN:END -->
