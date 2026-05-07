@echo off
:: NexusEmu silent launcher — starts the server in the background
:: Drop a shortcut to this file in shell:startup to auto-run on login

cd /d "%~dp0"
start "" /B cmd /C "npm run dev > nexus-server.log 2>&1"

:: Wait a moment then open the PWA in the default browser
timeout /t 4 /nobreak >nul
start "" "http://localhost:3000"
