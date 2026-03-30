@echo off
REM Script d'installation COMPLETE de la Marketplace avec MySQL
REM Detection automatique, configuration et lancement

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                                                              ║
echo ║        🚀 MARKETPLACE - INSTALLATION COMPLETE                ║
echo ║                                                              ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo Ce script va :
echo   1. Detecter et configurer MySQL
echo   2. Installer les dependances Python
echo   3. Creer la base de donnees et les tables
echo   4. Installer les dependances Node.js
echo   5. Ajouter les donnees de test
echo.
echo Appuyez sur une touche pour continuer...
pause >nul
echo.

echo ========================================
echo   ETAPE 1/5 : CONFIGURATION MYSQL
echo ========================================
echo.

cd backend
call setup_mysql_sans_path.bat

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERREUR lors de la configuration MySQL
    echo.
    echo Solutions :
    echo   1. Installez MySQL ou XAMPP
    echo   2. Consultez backend\SOLUTION_MYSQL_PATH.md
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ETAPE 2/5 : VERIFICATION BACKEND
echo ========================================
echo.

if not exist "venv\Scripts\activate.bat" (
    echo ERREUR : Environnement virtuel non cree
    pause
    exit /b 1
)

call venv\Scripts\activate

echo ✅ Backend configure avec succes !
echo.

echo ========================================
echo   ETAPE 3/5 : INSTALLATION FRONTEND
echo ========================================
echo.

cd ..\frontend

if not exist "package.json" (
    echo ERREUR : package.json non trouve
    pause
    exit /b 1
)

echo Installation des dependances Node.js...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERREUR lors de l'installation des dependances frontend
    pause
    exit /b 1
)

echo ✅ Frontend configure avec succes !
echo.

cd ..

echo ========================================
echo   ETAPE 4/5 : VERIFICATION COMPLETE
echo ========================================
echo.

echo Test de la connexion a la base de donnees...
cd backend
call venv\Scripts\activate
python test_mysql_connection.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERREUR : Probleme de connexion a MySQL
    pause
    exit /b 1
)

cd ..

echo.
echo ✅ Tous les tests passes !
echo.

echo ========================================
echo   INSTALLATION TERMINEE !
echo ========================================
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  🎉 MARKETPLACE INSTALLEE AVEC SUCCES !                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 📊 Configuration :
echo   - Base de donnees : marketplace_db
echo   - Utilisateurs    : 3 (admin, vendeur, client)
echo   - Produits        : 5 (iPhone, MacBook, iPad, etc.)
echo.
echo 🔑 Comptes de test :
echo   👨‍💼 Admin   : admin@marketplace.com / admin123
echo   🛒 Vendeur : vendeur@marketplace.com / vendeur123
echo   👤 Client  : client@marketplace.com / client123
echo.
echo.
echo ========================================
echo   ETAPE 5/5 : LANCEMENT (OPTIONNEL)
echo ========================================
echo.
set /p LAUNCH="Voulez-vous lancer l'application maintenant ? (O/N) : "

if /i "%LAUNCH%"=="O" (
    echo.
    echo 🚀 Lancement de l'application...
    echo.
    echo Deux fenetres vont s'ouvrir :
    echo   1. Backend (API)  - http://localhost:8000
    echo   2. Frontend (Web) - http://localhost:5173
    echo.
    timeout /t 2 /nobreak >nul
    
    start "Marketplace Backend" cmd /k "cd backend && venv\Scripts\activate && echo ✅ Backend lance sur http://localhost:8000 && echo 📚 Documentation : http://localhost:8000/docs && echo. && uvicorn app.main:app --reload"
    
    timeout /t 3 /nobreak >nul
    
    start "Marketplace Frontend" cmd /k "cd frontend && echo ✅ Frontend lance sur http://localhost:5173 && echo. && npm run dev"
    
    echo.
    echo ✅ Application lancee !
    echo.
    echo Acces :
    echo   🌐 Application : http://localhost:5173
    echo   🔧 API        : http://localhost:8000
    echo   📚 Docs       : http://localhost:8000/docs
    echo.
) else (
    echo.
    echo Pour lancer l'application plus tard :
    echo   .\start_marketplace.bat
    echo.
    echo Ou manuellement :
    echo   Terminal 1 : cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
    echo   Terminal 2 : cd frontend ^&^& npm run dev
    echo.
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo   📚 Documentation disponible :
echo   - CONFIGURATION_MYSQL_RAPIDE.md
echo   - MYSQL_CONFIGURATION_COMPLETE.md
echo   - backend\SOLUTION_MYSQL_PATH.md
echo ═══════════════════════════════════════════════════════════════
echo.
echo Merci d'utiliser Marketplace ! 🎉
echo.
pause
