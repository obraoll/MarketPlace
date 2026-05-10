# Script PowerShell pour configurer MySQL automatiquement
# Detecte MySQL et configure la base de donnees

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURATION MYSQL (AUTO-DETECT)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Liste des emplacements communs de MySQL
$mysqlPaths = @(
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe",
    "C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\xampp\mysql\bin\mysql.exe",
    "C:\wamp\bin\mysql\mysql8.0.27\bin\mysql.exe",
    "C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe",
    "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe"
)

# Recherche de MySQL
Write-Host "🔍 Recherche de MySQL sur votre ordinateur..." -ForegroundColor Yellow
Write-Host ""

$mysqlExe = $null

foreach ($path in $mysqlPaths) {
    if (Test-Path $path) {
        $mysqlExe = $path
        Write-Host "✅ TROUVE : $path" -ForegroundColor Green
        break
    }
}

if (-not $mysqlExe) {
    Write-Host "❌ ERREUR : MySQL n'a pas ete trouve !" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solutions :" -ForegroundColor Yellow
    Write-Host "  1. Installer MySQL : https://dev.mysql.com/downloads/installer/" -ForegroundColor White
    Write-Host "  2. Installer XAMPP : https://www.apachefriends.org/" -ForegroundColor White
    Write-Host ""
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

# Afficher la version
Write-Host ""
& $mysqlExe --version
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CREATION DE LA BASE DE DONNEES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Entrez le mot de passe root de MySQL :" -ForegroundColor Yellow
Write-Host "(Pour XAMPP, laissez vide et appuyez sur Entree)" -ForegroundColor Gray
Write-Host ""

# Commandes SQL
$sqlCommands = @"
CREATE DATABASE IF NOT EXISTS marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'marketplace_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Base de donnees creee avec succes !' AS Status;
"@

# Executer les commandes SQL
$process = Start-Process -FilePath $mysqlExe -ArgumentList "-u", "root", "-p", "-e", $sqlCommands -NoNewWindow -Wait -PassThru

if ($process.ExitCode -ne 0) {
    Write-Host ""
    Write-Host "❌ ERREUR lors de la creation de la base de donnees" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifications :" -ForegroundColor Yellow
    Write-Host "  1. MySQL est-il lance ?" -ForegroundColor White
    Write-Host "  2. Le mot de passe root est-il correct ?" -ForegroundColor White
    Write-Host "  3. Pour XAMPP : Essayez sans mot de passe" -ForegroundColor White
    Write-Host ""
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

Write-Host ""
Write-Host "✅ Base de donnees creee avec succes !" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURATION PYTHON" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Creer l'environnement virtuel si necessaire
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creation de l'environnement virtuel..." -ForegroundColor Yellow
    python -m venv venv
}

# Activer l'environnement virtuel
Write-Host "🔧 Activation de l'environnement virtuel..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Installer les dependances
Write-Host "📥 Installation des dependances..." -ForegroundColor Yellow
pip install -q pymysql cryptography sqlalchemy python-dotenv pydantic pydantic-settings "bcrypt>=4.1.2,<5" python-jose 2>$null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST DE CONNEXION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

python test_mysql_connection.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Test de connexion echoue" -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   INITIALISATION DE LA BASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

python init_mysql_database.py

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Initialisation echouee" -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour quitter"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   CONFIGURATION TERMINEE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ MySQL est configure et pret a l'emploi !" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Emplacement MySQL : $mysqlExe" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔑 Comptes de test :" -ForegroundColor Yellow
Write-Host "  👨‍💼 Admin   : admin@marketplace.com / admin123" -ForegroundColor White
Write-Host "  🛒 Vendeur : vendeur@marketplace.com / vendeur123" -ForegroundColor White
Write-Host "  👤 Client  : client@marketplace.com / client123" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Pour lancer le backend :" -ForegroundColor Yellow
Write-Host "  uvicorn app.main:app --reload" -ForegroundColor White
Write-Host ""
Read-Host "Appuyez sur Entree pour terminer"
