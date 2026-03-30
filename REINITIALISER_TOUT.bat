@echo off
REM Script de réinitialisation complète

echo.
echo ========================================
echo   REINITIALISATION COMPLETE
echo ========================================
echo.

echo [1/5] Arret des services...
echo.

REM Arrêter tous les processus node et python
taskkill /F /IM node.exe 2>nul
taskkill /F /IM python.exe 2>nul
taskkill /F /IM uvicorn.exe 2>nul

timeout /t 2 /nobreak >nul

echo ✅ Services arretes
echo.

echo [2/5] Reconfiguration base de donnees...
echo.

cd backend
call venv\Scripts\activate

REM Recréer la base
"C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe" -u root -e "DROP DATABASE IF EXISTS marketplace_db; CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

REM Initialiser
set PYTHONIOENCODING=utf-8
python init_mysql_database.py

echo ✅ Base recreee
echo.

echo [3/5] Redemarrage backend...
echo.

start "Backend" cmd /k "cd C:\Users\smith\marketplace\backend && venv\Scripts\activate && set PYTHONIOENCODING=utf-8 && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 5 /nobreak >nul

echo ✅ Backend demarre
echo.

echo [4/5] Redemarrage frontend...
echo.

cd ..\frontend
start "Frontend" cmd /k "cd C:\Users\smith\marketplace\frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo ✅ Frontend demarre
echo.

echo [5/5] Instructions...
echo.

echo ========================================
echo   REINITIALISATION TERMINEE
echo ========================================
echo.
echo ✅ Backend  : http://localhost:8000
echo ✅ Frontend : http://localhost:5173
echo.
echo 📝 IMPORTANT - Dans votre navigateur :
echo.
echo 1. Allez sur http://localhost:5173
echo 2. Appuyez sur F12
echo 3. Onglet Console
echo 4. Tapez : localStorage.clear()
echo 5. Appuyez sur Entree
echo 6. Tapez : location.reload()
echo 7. Appuyez sur Entree
echo.
echo 🔑 Comptes de test :
echo    admin@marketplace.com / admin123
echo    vendeur@marketplace.com / vendeur123
echo    client@marketplace.com / client123
echo.
echo Si probleme persiste :
echo    - Utilisez mode navigation privee (Ctrl+Shift+N)
echo    - Ou autre navigateur
echo.
pause
