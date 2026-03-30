@echo off
chcp 65001 >nul
title Backend Marketplace - Port 8000
echo.
echo ========================================
echo   Demarrage du backend (API)
echo   http://localhost:8000
echo ========================================
echo.

cd /d "%~dp0"

if not exist "venv\Scripts\activate.bat" (
  echo ERREUR : Environnement virtuel introuvable.
  echo Creez-le avec : python -m venv venv
  echo Puis : venv\Scripts\activate
  echo Et : pip install -r requirements.txt
  pause
  exit /b 1
)

call venv\Scripts\activate.bat
echo Backend demarre. Arretez avec Ctrl+C.
echo.
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
