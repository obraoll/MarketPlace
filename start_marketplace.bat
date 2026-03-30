@echo off
REM Script de démarrage de la Marketplace
REM Lance le backend et le frontend en parallèle

echo.
echo ========================================
echo   MARKETPLACE - Demarrage
echo ========================================
echo.

REM Vérifier que la configuration est faite
if not exist "backend\.env" (
    echo ERREUR: Fichier .env non trouve
    echo.
    echo Lancez d'abord: backend\configure_mysql.bat
    pause
    exit /b 1
)

if not exist "backend\venv" (
    echo ERREUR: Environnement virtuel non trouve
    echo.
    echo Lancez d'abord: backend\configure_mysql.bat
    pause
    exit /b 1
)

echo [1/2] Demarrage du backend (API)...
echo.
start "Marketplace Backend" cmd /k "cd backend && venv\Scripts\activate && echo Backend demarre sur http://localhost:8000 && echo Documentation: http://localhost:8000/docs && echo. && uvicorn app.main:app --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Demarrage du frontend...
echo.
start "Marketplace Frontend" cmd /k "cd frontend && echo Frontend demarre sur http://localhost:5173 && echo. && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   MARKETPLACE DEMARRE !
echo ========================================
echo.
echo Deux fenetres viennent de s'ouvrir:
echo   1. Backend  : http://localhost:8000
echo   2. Frontend : http://localhost:5173
echo.
echo Attendez quelques secondes que les serveurs demarrent...
echo.
echo Pour arreter l'application:
echo   - Fermez les deux fenetres de terminal
echo   - Ou appuyez sur Ctrl+C dans chaque fenetre
echo.
echo Comptes de test:
echo   - Admin   : admin@marketplace.com / admin123
echo   - Vendeur : vendeur@marketplace.com / vendeur123
echo   - Client  : client@marketplace.com / client123
echo.
pause
