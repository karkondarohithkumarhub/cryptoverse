@echo off
REM MySQL Setup Script for Cryptoverse
REM This script will download and install MySQL Community Edition

echo.
echo ====================================
echo  Cryptoverse MySQL Setup
echo ====================================
echo.

REM Check if MySQL is already installed
mysql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MySQL is already installed
    mysql --version
    goto :eof
)

echo.
echo MySQL is not installed. 
echo.
echo Please install MySQL Community Edition manually:
echo.
echo OPTION 1: Download and Install (Recommended)
echo -------------------------------------------
echo 1. Visit: https://dev.mysql.com/downloads/mysql/
echo 2. Download MySQL Community Edition (Windows MSI)
echo 3. Run the installer with these settings:
echo    - MySQL Server on port 3306
echo    - Set root password (or leave blank for no password)
echo    - Add MySQL to System PATH
echo 4. After installation, restart your terminal
echo 5. Run this script again
echo.
echo OPTION 2: Quick Setup with Default Settings
echo -------------------------------------------
echo Run this command in PowerShell (as Administrator):
echo.
echo   Start-Process powershell -ArgumentList 'curl -L https://dev.mysql.com/downloads/mysql/ -o mysql-installer.msi; Start-Process msi installer.msi'
echo.
echo OPTION 3: Use Docker (Fastest)
echo -------------------------------------------
echo If you have Docker installed:
echo.
echo   docker run --name cryptoverse-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=cryptoverse -p 3306:3306 -d mysql:8.0
echo.
echo Then edit backend/server.js and change the MySQL password to 'root'
echo.
pause
