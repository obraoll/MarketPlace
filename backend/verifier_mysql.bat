@echo off
REM Script pour verifier si MySQL est installe et ou il se trouve

echo.
echo ========================================
echo   VERIFICATION MYSQL
echo ========================================
echo.

echo [1] Verification de MySQL dans le PATH...
where mysql >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo OK - MySQL trouve dans le PATH
    mysql --version
    goto :found
) else (
    echo WARN - MySQL n'est pas dans le PATH
)
echo.

echo [2] Recherche de MySQL dans les emplacements communs...
echo.

REM Emplacements communs de MySQL
set "MYSQL_PATHS="
set "MYSQL_PATHS=%MYSQL_PATHS%;C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set "MYSQL_PATHS=%MYSQL_PATHS%;C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
set "MYSQL_PATHS=%MYSQL_PATHS%;C:\Program Files\MySQL\MySQL Server 9.0\bin\mysql.exe"
set "MYSQL_PATHS=%MYSQL_PATHS%;C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe"
set "MYSQL_PATHS=%MYSQL_PATHS%;C:\xampp\mysql\bin\mysql.exe"
set "MYSQL_PATHS=%MYSQL_PATHS%;C:\wamp\bin\mysql\mysql8.0.27\bin\mysql.exe"
set "MYSQL_PATHS=%MYSQL_PATHS%;C:\wamp64\bin\mysql\mysql8.0.27\bin\mysql.exe"
set "MYSQL_PATHS=%MYSQL_PATHS%;C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysql.exe"

for %%p in (%MYSQL_PATHS%) do (
    if exist "%%~p" (
        echo TROUVE : %%~p
        set "MYSQL_BIN=%%~p"
        goto :found_path
    )
)

echo.
echo ERREUR : MySQL n'a pas ete trouve !
echo.
echo Solutions possibles :
echo.
echo [Option 1] Installer MySQL
echo   Telechargez MySQL depuis : https://dev.mysql.com/downloads/installer/
echo   Ou installez XAMPP : https://www.apachefriends.org/
echo.
echo [Option 2] Ajouter MySQL au PATH
echo   Si MySQL est deja installe, ajoutez son dossier bin au PATH Windows
echo.
pause
exit /b 1

:found_path
echo.
echo ========================================
echo   MySQL TROUVE !
echo ========================================
echo.
echo Emplacement : %MYSQL_BIN%
echo.
echo [3] Voulez-vous ajouter MySQL au PATH ? (O/N)
set /p ADD_PATH="Reponse (O/N) : "

if /i "%ADD_PATH%"=="O" (
    echo.
    echo Pour ajouter MySQL au PATH :
    echo.
    echo 1. Copiez ce chemin :
    for %%p in ("%MYSQL_BIN%") do echo    %%~dpp
    echo.
    echo 2. Appuyez sur la touche Windows et tapez "variables"
    echo 3. Cliquez sur "Modifier les variables d'environnement systeme"
    echo 4. Cliquez sur "Variables d'environnement"
    echo 5. Dans "Variables systeme", selectionnez "Path" et cliquez "Modifier"
    echo 6. Cliquez "Nouveau" et collez le chemin copie
    echo 7. Cliquez OK partout
    echo 8. REDEMARREZ PowerShell
    echo.
    pause
)

echo.
echo [4] Voulez-vous utiliser MySQL maintenant ? (O/N)
set /p USE_NOW="Reponse (O/N) : "

if /i "%USE_NOW%"=="O" (
    echo.
    echo Lancement de MySQL...
    echo.
    "%MYSQL_BIN%" --version
    echo.
    echo Pour creer la base de donnees, utilisez :
    echo "%MYSQL_BIN%" -u root -p
    echo.
    pause
    "%MYSQL_BIN%" -u root -p
)

goto :end

:found
echo.
echo MySQL est deja dans le PATH et fonctionne !
echo.

:end
echo.
echo Termine !
pause
