@echo off
chcp 65001 >nul
title Arret processus port 8000
echo Arret des processus en ecoute sur le port 8000...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$pids = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; foreach ($procId in $pids) { if ($procId) { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue; Write-Host ('PID ' + $procId + ' arrete.') } }"
echo Termine. Relancez demarrer_backend.bat ou uvicorn.
pause
