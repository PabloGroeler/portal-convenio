# Script PowerShell para corrigir o problema do Flyway V7
# Execute: .\fix-flyway.ps1

Write-Host "🔧 Corrigindo checksum do Flyway V7..." -ForegroundColor Yellow
Write-Host ""

# Obter nome do container do PostgreSQL
$postgresContainer = docker ps --filter "name=postgres" --format "{{.Names}}" | Select-Object -First 1

if ([string]::IsNullOrEmpty($postgresContainer)) {
    Write-Host "❌ Container PostgreSQL não encontrado!" -ForegroundColor Red
    Write-Host "Execute: docker-compose up -d postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Container encontrado: $postgresContainer" -ForegroundColor Green
Write-Host ""

# Deletar registro da migration V7 do histórico do Flyway
Write-Host "🗑️  Deletando migration V7 do histórico do Flyway..." -ForegroundColor Yellow

$sqlCommand = "DELETE FROM flyway_schema_history WHERE version = '7'; SELECT 'Migration V7 deletada!' as status;"

docker exec -i $postgresContainer psql -U postgres -d app_emendas -c $sqlCommand

Write-Host ""
Write-Host "✅ Pronto! Agora execute:" -ForegroundColor Green
Write-Host "   docker-compose restart app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ou reinicie tudo:" -ForegroundColor Yellow
Write-Host "   docker-compose down" -ForegroundColor Cyan
Write-Host "   docker-compose up --build" -ForegroundColor Cyan

