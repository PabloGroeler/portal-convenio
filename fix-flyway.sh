#!/bin/bash
# Script para corrigir o problema do Flyway V7

echo "🔧 Corrigindo checksum do Flyway V7..."

# Obter nome do container do PostgreSQL
POSTGRES_CONTAINER=$(docker ps --filter "name=postgres" --format "{{.Names}}" | head -n 1)

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo "❌ Container PostgreSQL não encontrado!"
    echo "Execute: docker-compose up -d postgres"
    exit 1
fi

echo "✅ Container encontrado: $POSTGRES_CONTAINER"

# Deletar registro da migration V7 do histórico do Flyway
echo "🗑️  Deletando migration V7 do histórico do Flyway..."

docker exec -i $POSTGRES_CONTAINER psql -U postgres -d app_emendas <<EOF
DELETE FROM flyway_schema_history WHERE version = '7';
SELECT 'Migration V7 deletada!' as status;
EOF

echo ""
echo "✅ Pronto! Agora execute:"
echo "   docker-compose restart app"
echo ""
echo "Ou reinicie tudo:"
echo "   docker-compose down"
echo "   docker-compose up --build"

