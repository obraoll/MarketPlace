@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Marketplace - Demarrage backend + frontend
echo ========================================
echo.
echo Ouverture de 2 fenetres :
echo   1) Backend  (port 8000) - NE PAS FERMER
echo   2) Frontend (port 5173)
echo.
echo Une fois les 2 demarres, ouvrez : http://localhost:5173
echo.

cd /d "%~dp0"

start "Backend - NE PAS FERMER" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && echo Backend sur http://localhost:8000 - Gardez cette fenetre ouverte. && echo. && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "cd /d %~dp0frontend && echo Frontend sur http://localhost:5173 && echo. && npm run dev"

echo.
echo Les 2 fenetres sont ouvertes.
echo Attendez quelques secondes puis allez sur : http://localhost:5173
echo.
pause
