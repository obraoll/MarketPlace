@echo off
chcp 65001 >nul
title Migration MySQL - reference_price_neuf
echo.
echo ========================================
echo   Ajout colonne products.reference_price_neuf
echo ========================================
echo.
echo Sans cette colonne, l API renvoie une erreur et le site n affiche plus les produits.
echo.
if "%MYSQL_DATABASE%"=="" (
  echo Variables non definies : definissez MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
  echo ou executez le SQL a la main dans phpMyAdmin :
  echo   %~dp0migrations\20260412_products_reference_price_neuf.sql
  echo.
  pause
  exit /b 1
)
mysql -u "%MYSQL_USER%" -p"%MYSQL_PASSWORD%" "%MYSQL_DATABASE%" < "%~dp0migrations\20260412_products_reference_price_neuf.sql"
if errorlevel 1 (
  echo Echec. Essayez phpMyAdmin avec le fichier SQL ci-dessus.
  pause
  exit /b 1
)
echo OK. Redemarrez le backend si besoin.
pause
