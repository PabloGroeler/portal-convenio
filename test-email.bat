@echo off
echo ==================================
echo   SMTP Test via API Endpoint
echo ==================================
echo.

set /p EMAIL="Enter recipient email address: "

if "%EMAIL%"=="" (
    echo Error: No email provided
    exit /b 1
)

echo.
echo Testing SMTP configuration...
echo.
echo Step 1: Checking email configuration...
curl -s http://localhost:8080/api/test-email/config

echo.
echo.
echo Step 2: Sending test email to %EMAIL%...
echo.
curl -s http://localhost:8080/api/test-email/send?to=%EMAIL%

echo.
echo.
echo ==================================
echo Test completed!
echo ==================================
echo.
echo If successful, check the inbox of: %EMAIL%
echo.
pause
