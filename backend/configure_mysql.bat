@echo off
REM Script de configuration MySQL pour Marketplace
REM Windows PowerShell / CMD

echo.
echo ========================================
echo   CONFIGURATION MYSQL - MARKETPLACE
echo ========================================
echo.

echo [Etape 1/4] Verification de MySQL...
echo.
where mysql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: MySQL n'est pas installe ou pas dans le PATH
    echo.
    echo Installez MySQL depuis: https://dev.mysql.com/downloads/installer/
    echo Ou utilisez XAMPP: https://www.apachefriends.org/
    pause
    exit /b 1
)
echo OK - MySQL trouve dans le PATH
echo.

echo [Etape 2/4] Creation de la base de donnees...
echo.
echo Entrez le mot de passe root de MySQL:
mysql -u root -p < setup_mysql.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Impossible de creer la base de donnees
    echo Verifiez que MySQL est lance et que le mot de passe est correct
    pause
    exit /b 1
)
echo OK - Base de donnees creee
echo.

echo [Etape 3/4] Test de connexion...
echo.
if not exist venv (
    echo Creation de l'environnement virtuel...
    python -m venv venv
)
call venv\Scripts\activate
pip install -q pymysql cryptography sqlalchemy python-dotenv pydantic pydantic-settings 2>nul
python test_mysql_connection.py
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Test de connexion echoue
    pause
    exit /b 1
)
echo.

echo [Etape 4/4] Creation des tables et donnees de test...
echo.
python init_mysql_database.py
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Initialisation echouee
    pause
    exit /b 1
)
echo.

echo ========================================
echo   CONFIGURATION TERMINEE !
echo ========================================
echo.
echo Votre marketplace est prete avec MySQL
echo.
echo Comptes de test:
echo   - Admin   : admin@marketplace.com / admin123
echo   - Vendeur : vendeur@marketplace.com / vendeur123
echo   - Client  : client@marketplace.com / client123
echo.
echo Pour lancer le backend:
echo   cd backend
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload
echo.
pause
