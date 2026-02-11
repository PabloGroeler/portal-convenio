# Simple SMTP Test using curl
# Tests SMTP connection without needing to restart the application

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Quick SMTP Connection Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Load .env file
if (Test-Path ".env") {
    Write-Host "✓ Loading .env configuration..." -ForegroundColor Green
    Get-Content ".env" | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)\s*=\s*(.+)\s*$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Variable -Name $key.Replace('QUARKUS_MAILER_', '') -Value $value -Scope Script
        }
    }
} else {
    Write-Host "✗ .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "SMTP Configuration:" -ForegroundColor Yellow
Write-Host "  Host:     $HOST"
Write-Host "  Port:     $PORT"
Write-Host "  From:     $FROM"
Write-Host "  Username: $USERNAME"
Write-Host ""

# Ask for recipient
$recipient = Read-Host "Enter recipient email for test"

if ([string]::IsNullOrWhiteSpace($recipient)) {
    Write-Host "✗ No recipient provided." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Testing SMTP connection..." -ForegroundColor Cyan

# Create test email content
$emailBody = @"
From: $FROM
To: $recipient
Subject: SMTP Test - Portal de Emendas

Este é um email de teste do sistema Portal de Emendas.

Se você recebeu este email, a configuração SMTP está funcionando corretamente.

Configuração testada:
- Servidor: $HOST
- Porta: $PORT
- Data/Hora: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

---
Sistema Portal de Emendas
Câmara Municipal de Sinop
"@

# Save to temp file
$tempFile = [System.IO.Path]::GetTempFileName()
$emailBody | Out-File -FilePath $tempFile -Encoding ASCII

try {
    # Test using curl (requires curl to be installed)
    Write-Host "Attempting to send email via SMTP..." -ForegroundColor Yellow

    $curlArgs = @(
        "--url", "smtps://${HOST}:${PORT}",
        "--ssl-reqd",
        "--mail-from", $FROM,
        "--mail-rcpt", $recipient,
        "--user", "${USERNAME}:${PASSWORD}",
        "--upload-file", $tempFile,
        "-v"
    )

    $result = & curl @curlArgs 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "==================================" -ForegroundColor Green
        Write-Host "✓ Email sent successfully!" -ForegroundColor Green
        Write-Host "==================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Check the inbox of: $recipient" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "==================================" -ForegroundColor Red
        Write-Host "✗ Failed to send email" -ForegroundColor Red
        Write-Host "==================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Error details:" -ForegroundColor Yellow
        Write-Host $result
    }
} catch {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Red
    Write-Host "✗ Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "==================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Note: This test requires 'curl' to be installed." -ForegroundColor Yellow
    Write-Host "Alternative: Use the application's email test endpoint." -ForegroundColor Yellow
} finally {
    # Cleanup
    Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Cyan
