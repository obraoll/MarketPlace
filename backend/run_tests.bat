@echo off
REM Script pour lancer les tests facilement

echo.
echo ========================================
echo   MARKETPLACE - TESTS
echo ========================================
echo.

if not exist venv (
    echo ERREUR: Environnement virtuel non trouve
    echo Lancez d'abord: python -m venv venv
    pause
    exit /b 1
)

echo Activation de l'environnement virtuel...
call venv\Scripts\activate

echo.
echo Installation/mise a jour des dependances de test...
pip install -q pytest pytest-cov pytest-asyncio

echo.
echo ========================================
echo   LANCEMENT DES TESTS
echo ========================================
echo.

REM Definir l'encodage pour les emojis
set PYTHONIOENCODING=utf-8

REM Lancer les tests avec couverture
pytest --cov=app --cov-report=term --cov-report=html tests/

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   TESTS REUSSIS !
    echo ========================================
    echo.
    echo Rapport de couverture HTML genere dans: htmlcov\index.html
    echo.
    set /p OPEN="Ouvrir le rapport HTML ? (O/N) : "
    if /i "%OPEN%"=="O" (
        start htmlcov\index.html
    )
) else (
    echo.
    echo ========================================
    echo   TESTS ECHOUES
    echo ========================================
    echo.
    echo Verifiez les erreurs ci-dessus
)

echo.
pause
