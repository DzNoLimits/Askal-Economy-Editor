@echo off
title DayZ Economy Editor - Unified Server (Auto-Reload)
color 0B

echo.
echo  🚀 DayZ Economy Editor - Servidor Unificado
echo  ==========================================
echo.
echo  📍 URL: http://localhost:3001
echo  🔧 Frontend + Backend em uma porta só
echo.
echo  💡 Modificações no backend recarregam automaticamente!
echo  🔄 Para frontend: compile e aperte F5
echo.

cd /d "c:\Users\Rocha\OneDrive\Desktop\Askal Economy Editor\backend"

echo 📦 Compilando frontend...
cd ..\frontend
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro na compilação do frontend!
    pause
    exit /b 1
)

echo ✅ Frontend compilado!
echo.

cd ..\backend

echo 🚀 Iniciando servidor unificado com auto-reload...
echo 💡 Pressione Ctrl+C para parar
echo.

nodemon server_unified.js

pause