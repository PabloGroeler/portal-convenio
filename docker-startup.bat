@echo off
echo ============================================
echo Portal de Emendas - Docker Startup Script
echo ============================================
echo.

echo [1/5] Stopping existing containers...
docker-compose down

echo.
echo [2/5] Removing old volumes (optional - preserves data if skipped)...
set /p remove_volumes="Remove volumes? This will DELETE ALL DATA (y/N): "
if /i "%remove_volumes%"=="y" (
    docker volume rm code-with-quarkus_postgres_data
    echo Volumes removed.
) else (
    echo Volumes preserved.
)

echo.
echo [3/5] Building images...
docker-compose build --no-cache

echo.
echo [4/5] Starting services...
docker-compose up -d

echo.
echo [5/5] Waiting for services to be ready...
timeout /t 10

echo.
echo ============================================
echo Checking service status...
echo ============================================
docker-compose ps

echo.
echo ============================================
echo PostgreSQL logs (last 20 lines):
echo ============================================
docker-compose logs --tail=20 postgres

echo.
echo ============================================
echo Backend logs (last 20 lines):
echo ============================================
docker-compose logs --tail=20 app

echo.
echo ============================================
echo Checking if database was created...
echo ============================================
docker exec portal-emendas-postgres psql -U app -d app_emendas -c "\l"

echo.
echo ============================================
echo Checking Flyway migrations...
echo ============================================
docker exec portal-emendas-postgres psql -U app -d app_emendas -c "SELECT version, description, installed_on, success FROM flyway_schema_history ORDER BY installed_rank;"

echo.
echo ============================================
echo Setup complete!
echo ============================================
echo.
echo Services available at:
echo - Frontend:  http://localhost:3000
echo - Backend:   http://localhost:8080
echo - Swagger:   http://localhost:8080/swagger-ui
echo.
echo To view logs:
echo   docker-compose logs -f [service-name]
echo.
echo To stop services:
echo   docker-compose down
echo.
pause

