@echo off
echo ============================================
echo Portal de Emendas - Docker Diagnostics
echo ============================================
echo.

echo [1] Container Status:
echo ============================================
docker-compose ps
echo.

echo [2] PostgreSQL Container Info:
echo ============================================
docker inspect portal-emendas-postgres --format='{{.State.Status}}'
echo.

echo [3] PostgreSQL Logs (last 50 lines):
echo ============================================
docker-compose logs --tail=50 postgres
echo.

echo [4] Backend Logs (last 50 lines):
echo ============================================
docker-compose logs --tail=50 app
echo.

echo [5] Check if PostgreSQL is accepting connections:
echo ============================================
docker exec portal-emendas-postgres pg_isready -U app -d app_emendas
echo.

echo [6] List all databases:
echo ============================================
docker exec portal-emendas-postgres psql -U app -d postgres -c "\l"
echo.

echo [7] Check if app_emendas database exists:
echo ============================================
docker exec portal-emendas-postgres psql -U app -d postgres -c "SELECT datname FROM pg_database WHERE datname='app_emendas';"
echo.

echo [8] If database exists, check tables:
echo ============================================
docker exec portal-emendas-postgres psql -U app -d app_emendas -c "\dt" 2>nul
if errorlevel 1 (
    echo Database 'app_emendas' does not exist yet or cannot connect.
) else (
    echo Tables listed above.
)
echo.

echo [9] If database exists, check Flyway migrations:
echo ============================================
docker exec portal-emendas-postgres psql -U app -d app_emendas -c "SELECT * FROM flyway_schema_history ORDER BY installed_rank;" 2>nul
if errorlevel 1 (
    echo Flyway schema history not found - migrations may not have run yet.
)
echo.

echo [10] Environment variables in backend container:
echo ============================================
docker exec portal-emendas-backend printenv | findstr QUARKUS
echo.

echo ============================================
echo Diagnostics complete!
echo ============================================
pause

