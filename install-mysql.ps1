Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Cryptoverse MySQL Auto-Installer" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking for existing MySQL installation..." -ForegroundColor Yellow
try {
    mysql --version
    Write-Host "MySQL is already installed!" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "MySQL not found, proceeding with installation..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 1: Downloading MySQL Community Edition..." -ForegroundColor Cyan

$tempDir = "$env:TEMP\MySQLInstall"
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
}

$installerPath = "$tempDir\mysql-installer.msi"
$downloadUrl = "https://mysql.mirrors.hoobly.com/Downloads/MySQLInstaller/mysql-installer-community-8.0.36.0.msi"

Write-Host "Downloading MySQL from mirror..." -ForegroundColor Yellow

try {
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($downloadUrl, $installerPath)
    Write-Host "Download successful!" -ForegroundColor Green
} catch {
    Write-Host "Download failed. Trying alternative mirror..." -ForegroundColor Yellow
    $downloadUrl = "https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-community-8.0.36.0.msi"
    try {
        $webClient.DownloadFile($downloadUrl, $installerPath)
        Write-Host "Download successful!" -ForegroundColor Green
    } catch {
        Write-Host "Manual download required" -ForegroundColor Red
        Write-Host "Please download from: https://dev.mysql.com/downloads/mysql/" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Step 2: Installing MySQL (this may take a few minutes)..." -ForegroundColor Cyan

try {
    Start-Process -FilePath $installerPath -Wait
    Write-Host "Installation complete!" -ForegroundColor Green
} catch {
    Write-Host "Installation failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Starting MySQL Service..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue | Start-Service -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Step 4: Verifying Installation..." -ForegroundColor Cyan
mysql --version

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✅ MySQL Installation Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Start the Cryptoverse server with:" -ForegroundColor Yellow
Write-Host "  cd 'c:\Users\ZUBAIR\OneDrive\Desktop\Cryptoverse\backend'" -ForegroundColor Gray
Write-Host "  node server.js" -ForegroundColor Gray
Write-Host ""
