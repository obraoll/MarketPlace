@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Réinitialisation des mots de passe
echo   (admin, vendeur, client)
echo ========================================
echo.

cd /d "%~dp0"
if exist "venv\Scripts\activate.bat" (
  call venv\Scripts\activate.bat
) else (
  echo Activez d'abord le venv : venv\Scripts\activate
  echo Puis lancez : python reset_passwords.py
  pause
  exit /b 1
)

python reset_passwords.py
echo.
echo Redémarrez le backend (uvicorn app.main:app --reload) puis réessayez de vous connecter.
echo.
pause
