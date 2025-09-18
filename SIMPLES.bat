@echo off
title DayZ Economy Editor - SIMPLES
color 0A

echo.
echo  🚀 DayZ Economy Editor - MODO SIMPLES
echo  ====================================
echo.
echo  💡 Apenas 1 URL: http://localhost:3001
echo  🔧 Tudo em um lugar só!
echo.

cd /d "c:\Users\Rocha\OneDrive\Desktop\Askal Economy Editor"

echo 📦 Compilando interface...
cd frontend
call npm run build > nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro! Tente novamente.
    pause
    exit
)

echo ✅ Interface compilada!
echo.

cd ..\backend
echo 🚀 Iniciando servidor...
echo.
echo ✅ PRONTO! Abrindo http://localhost:3001
echo.
echo 💡 Para modificar:
echo    1. Edite os arquivos
echo    2. Rode este script novamente
echo    3. Aperte F5 no navegador
echo.

:: Abrir navegador automaticamente
start http://localhost:3001

:: Iniciar servidor unificado
nodemon server_unified.js

pause