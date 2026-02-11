# Test SMTP Configuration
# This script sends a test email using the configured SMTP settings

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  SMTP Configuration Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Load .env file
if (Test-Path ".env") {
    Write-Host "✓ Loading .env file..." -ForegroundColor Green
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.+)\s*$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Current SMTP Configuration:" -ForegroundColor Yellow
Write-Host "  Host:     $env:QUARKUS_MAILER_HOST"
Write-Host "  Port:     $env:QUARKUS_MAILER_PORT"
Write-Host "  From:     $env:QUARKUS_MAILER_FROM"
Write-Host "  Username: $env:QUARKUS_MAILER_USERNAME"
Write-Host "  Mock:     $env:QUARKUS_MAILER_MOCK"
Write-Host ""

# Ask for recipient email
$recipient = Read-Host "Enter recipient email address for test"

if ([string]::IsNullOrWhiteSpace($recipient)) {
    Write-Host "✗ No recipient provided. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Sending test email to: $recipient" -ForegroundColor Cyan

# Create a temporary Java class to test SMTP
$testEmailEndpoint = @"
package org.acme.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;

@Path("/test-email")
public class TestEmailResource {

    @Inject
    Mailer mailer;

    @GET
    public String sendTestEmail(@QueryParam("to") String to) {
        try {
            mailer.send(Mail.withText(to,
                "SMTP Test - Portal de Emendas",
                "Este é um email de teste do sistema Portal de Emendas.\n\n" +
                "Se você recebeu este email, a configuração SMTP está funcionando corretamente.\n\n" +
                "Data/Hora: " + java.time.LocalDateTime.now() + "\n" +
                "Servidor: " + System.getenv("QUARKUS_MAILER_HOST") + ":" + System.getenv("QUARKUS_MAILER_PORT")
            ));
            return "✓ Email enviado com sucesso para: " + to;
        } catch (Exception e) {
            return "✗ Erro ao enviar email: " + e.getMessage();
        }
    }
}
"@

# Save temporary test endpoint
$testFilePath = "src\main\java\org\acme\resource\TestEmailResource.java"
if (-not (Test-Path "src\main\java\org\acme\resource")) {
    New-Item -ItemType Directory -Path "src\main\java\org\acme\resource" -Force | Out-Null
}

Write-Host "Creating temporary test endpoint..." -ForegroundColor Yellow
$testEmailEndpoint | Out-File -FilePath $testFilePath -Encoding UTF8

Write-Host "Starting Quarkus in dev mode (this may take a moment)..." -ForegroundColor Yellow
Write-Host ""

# Start Quarkus in background and wait for it to be ready
$quarkusProcess = Start-Process -FilePath ".\mvnw.cmd" -ArgumentList "quarkus:dev" -PassThru -WindowStyle Hidden

Write-Host "Waiting for Quarkus to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Try to send test email
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/test-email?to=$recipient" -Method GET -TimeoutSec 30
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Check the inbox of $recipient" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Red
    Write-Host "✗ Error testing SMTP:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "==================================" -ForegroundColor Red
}

# Cleanup
Write-Host ""
Write-Host "Stopping Quarkus..." -ForegroundColor Yellow
Stop-Process -Id $quarkusProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host "Removing temporary test endpoint..." -ForegroundColor Yellow
Remove-Item -Path $testFilePath -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Cyan
