@echo off
REM Script de configuration MySQL SANS que MySQL soit dans le PATH
REM Detecte automatiquement l'emplacement de MySQL

echo.
echo ========================================
echo   CONFIGURATION MYSQL (AUTO-DETECT)
echo ========================================
echo.

REM Recherche automatique de MySQL
set "MYSQL_EXE="

echo Recherche de MySQL sur votre ordinateur...
echo.

REM Emplacements communs
if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
if exist "C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe"
if exist "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe" set "MYSQL_EXE=C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe"
if exist "C:\xampp\mysql\bin\mysql.exe" set "MYSQL_EXE=C:\xampp\mysql\bin\mysql.exe"
if exist "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" set "MYSQL_EXE=C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe"
if exist "C:\wamp\bin\mysql\mysql8.0.27\bin\mysql.exe" set "MYSQL_EXE=C:\wamp\bin\mysql\mysql8.0.27\bin\mysql.exe"
if exist "C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe" set "MYSQL_EXE=C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe"
if exist "C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe" set "MYSQL_EXE=C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe"

if "%MYSQL_EXE%"=="" (
    echo ERREUR : MySQL n'a pas ete trouve sur votre ordinateur !
    echo.
    echo Veuillez installer MySQL depuis :
    echo   - MySQL : https://dev.mysql.com/downloads/installer/
    echo   - XAMPP : https://www.apachefriends.org/
    echo.
    pause
    exit /b 1
)

echo TROUVE : %MYSQL_EXE%
echo.
"%MYSQL_EXE%" --version
echo.

echo ========================================
echo   CREATION DE LA BASE DE DONNEES
echo ========================================
echo.
echo Entrez le mot de passe root de MySQL :
echo (Appuyez sur Entree si pas de mot de passe)
echo.

"%MYSQL_EXE%" -u root -p -e "CREATE DATABASE IF NOT EXISTS marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'marketplace_user'@'localhost' IDENTIFIED BY 'password123'; GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost'; FLUSH PRIVILEGES; SELECT 'Base de donnees creee avec succes !' AS Status;"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERREUR lors de la creation de la base de donnees
    echo.
    echo Verifications :
    echo   1. MySQL est-il lance ?
    echo   2. Le mot de passe root est-il correct ?
    echo   3. XAMPP/WAMP : Le mot de passe par defaut est souvent vide
    echo.
    pause
    exit /b 1
)

echo.
echo OK - Base de donnees creee avec succes !
echo.

echo ========================================
echo   CONFIGURATION PYTHON
echo ========================================
echo.

if not exist venv (
    echo Creation de l'environnement virtuel...
    python -m venv venv
)

echo Activation de l'environnement virtuel...
call venv\Scripts\activate

echo Installation des dependances...
pip install -q pymysql cryptography sqlalchemy python-dotenv pydantic pydantic-settings "bcrypt>=4.1.2,<5" python-jose

echo.
echo ========================================
echo   TEST DE CONNEXION
echo ========================================
echo.

python test_mysql_connection.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERREUR : Test de connexion echoue
    pause
    exit /b 1
)

echo.
echo ========================================
echo   INITIALISATION DE LA BASE
echo ========================================
echo.

python init_mysql_database.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERREUR : Initialisation echouee
    pause
    exit /b 1
)

echo.
echo ========================================
echo   CONFIGURATION TERMINEE !
echo ========================================
echo.
echo MySQL est configure et pret a l'emploi !
echo.
echo Emplacement MySQL : %MYSQL_EXE%
echo.
echo Comptes de test :
echo   - Admin   : admin@marketplace.com / admin123
echo   - Vendeur : vendeur@marketplace.com / vendeur123
echo   - Client  : client@marketplace.com / client123
echo.
echo Pour lancer le backend :
echo   uvicorn app.main:app --reload
echo.
pause
