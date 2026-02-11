#!/bin/bash

# Script para reparar checksums do Flyway no Docker
# Execute este script se o problema de checksum persistir

echo "🔧 Reparando checksums do Flyway no Docker..."

# Opção 1: Rebuild containers do zero
echo ""
echo "Opção 1: Rebuild completo (recomendado)"
echo "----------------------------------------"
echo "docker-compose down -v"
echo "docker-compose up --build -d"
echo ""

# Opção 2: Rodar repair manualmente no container
echo "Opção 2: Repair manual no container rodando"
echo "--------------------------------------------"
echo "docker exec -it portal-emendas-backend /bin/bash"
echo "# Dentro do container, rodar:"
echo "curl -X POST http://localhost:8080/q/flyway/repair"
echo ""

# Opção 3: SQL direto no PostgreSQL
echo "Opção 3: Atualizar checksum diretamente no banco"
echo "-------------------------------------------------"
echo "docker exec -it portal-emendas-postgres psql -U app -d app_emendas"
echo "# Dentro do PostgreSQL, rodar:"
echo "UPDATE flyway_schema_history SET checksum = NULL WHERE version = '7';"
echo "# Ou deletar e deixar Flyway reaplicar:"
echo "DELETE FROM flyway_schema_history WHERE version = '7';"
echo ""

# Opção 4: Limpar volume e recomeçar
echo "Opção 4: Limpar volume do PostgreSQL (CUIDADO: perde dados!)"
echo "-------------------------------------------------------------"
echo "docker-compose down"
echo "docker volume rm code-with-quarkus_postgres_data"
echo "docker-compose up -d"
echo ""

echo "✅ Execute uma das opções acima conforme sua necessidade"
