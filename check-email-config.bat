@echo off
echo ========================================
echo   Checking Email Configuration in Docker
echo ========================================
echo.

echo Checking if container is running...
docker ps | findstr portal-emendas-backend >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Backend container is not running!
    echo Start it with: docker-compose up -d
    pause
    exit /b 1
)

echo [OK] Container is running
echo.

echo ========================================
echo   EMAIL CONFIGURATION
echo ========================================
echo.

echo QUARKUS_MAILER_FROM:
docker exec portal-emendas-backend printenv QUARKUS_MAILER_FROM
echo.

echo QUARKUS_MAILER_HOST:
docker exec portal-emendas-backend printenv QUARKUS_MAILER_HOST
echo.

echo QUARKUS_MAILER_PORT:
docker exec portal-emendas-backend printenv QUARKUS_MAILER_PORT
echo.

echo QUARKUS_MAILER_USERNAME:
docker exec portal-emendas-backend printenv QUARKUS_MAILER_USERNAME
echo.

echo QUARKUS_MAILER_PASSWORD:
docker exec portal-emendas-backend printenv QUARKUS_MAILER_PASSWORD 2>nul
if %errorlevel% equ 0 (
    echo [Hidden for security - but it exists]
) else (
    echo [NOT SET]
)
echo.

echo QUARKUS_MAILER_MOCK:
docker exec portal-emendas-backend printenv QUARKUS_MAILER_MOCK
echo.

echo QUARKUS_MAILER_SSL:
docker exec portal-emendas-backend printenv QUARKUS_MAILER_SSL
echo.

echo QUARKUS_MAILER_START_TLS:
docker exec portal-emendas-backend printenv QUARKUS_MAILER_START_TLS
echo.

echo ========================================
echo   Test email configuration:
echo   curl "http://localhost:8080/api/test-email/config"
echo ========================================
echo.

pause
