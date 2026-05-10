@echo off
REM Script de configuration MySQL pour WampServer
REM Utilise le MySQL de WampServer64

echo.
echo ========================================
echo   CONFIGURATION MYSQL (WAMPSERVER)
echo ========================================
echo.

set "MYSQL_EXE=C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe"

echo MySQL trouve dans WampServer :
echo %MYSQL_EXE%
echo.
"%MYSQL_EXE%" --version
echo.

echo ========================================
echo   VERIFICATION WAMPSERVER
echo ========================================
echo.
echo IMPORTANT : Verifiez que WampServer est lance !
echo   - Icone verte dans la barre des taches = OK
echo   - Icone orange/rouge = Demarrez MySQL depuis WampServer
echo.
set /p CONTINUE="WampServer est-il lance ? (O/N) : "

if /i not "%CONTINUE%"=="O" (
    echo.
    echo Veuillez demarrer WampServer et relancer ce script.
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   CREATION DE LA BASE DE DONNEES
echo ========================================
echo.
echo Entrez le mot de passe root de MySQL :
echo (Pour WampServer, le mot de passe par defaut est souvent VIDE)
echo (Appuyez juste sur Entree si pas de mot de passe)
echo.

"%MYSQL_EXE%" -u root -p -e "CREATE DATABASE IF NOT EXISTS marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS 'marketplace_user'@'localhost' IDENTIFIED BY 'password123'; GRANT ALL PRIVILEGES ON marketplace_db.* TO 'marketplace_user'@'localhost'; FLUSH PRIVILEGES; SELECT 'Base de donnees creee avec succes !' AS Status;"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERREUR lors de la creation de la base de donnees
    echo.
    echo Verifications :
    echo   1. WampServer est-il lance ? (icone verte)
    echo   2. MySQL est-il demarre dans WampServer ?
    echo   3. Le mot de passe root est-il correct ?
    echo      (Par defaut WampServer n'a PAS de mot de passe root)
    echo.
    echo Pour tester sans mot de passe, essayez :
    echo   "%MYSQL_EXE%" -u root
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Base de donnees creee avec succes !
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
    echo ❌ ERREUR : Test de connexion echoue
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
    echo ❌ ERREUR : Initialisation echouee
    pause
    exit /b 1
)

echo.
echo ========================================
echo   CONFIGURATION TERMINEE !
echo ========================================
echo.
echo ✅ MySQL (WampServer) est configure et pret !
echo.
echo 📍 Emplacement MySQL : %MYSQL_EXE%
echo.
echo 🔑 Comptes de test :
echo   👨‍💼 Admin   : admin@marketplace.com / admin123
echo   🛒 Vendeur : vendeur@marketplace.com / vendeur123
echo   👤 Client  : client@marketplace.com / client123
echo.
echo 💡 Conseil : Gardez WampServer lance pendant le developpement
echo.
echo Pour lancer le backend :
echo   uvicorn app.main:app --reload
echo.
pause
