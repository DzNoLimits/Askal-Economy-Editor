@echo off
title DayZ Economy Editor - Development Server
color 0A

echo.
echo  ████████╗ ███████╗ ██╗   ██╗ ████████╗
echo  ╚══██╔══╝ ██╔════╝ ██║   ██║ ╚══██╔══╝
echo     ██║    █████╗   ██║   ██║    ██║
echo     ██║    ██╔══╝   ╚██╗ ██╔╝    ██║
echo     ██║    ███████╗  ╚████╔╝     ██║
echo     ╚═╝    ╚══════╝   ╚═══╝      ╚═╝
echo.
echo  🚀 DayZ Economy Editor - Auto-Reload Mode
echo  ===============================================
echo.
echo  📍 Frontend: http://localhost:3000 (Hot Reload)
echo  🔧 Backend:  http://localhost:3001 (API)
echo.
echo  💡 Modificações detectadas automaticamente!
echo  🔄 Só apertar F5 no navegador para atualizar
echo.
echo  ⚠️  Para parar: Ctrl+C
echo.

cd /d "c:\Users\Rocha\OneDrive\Desktop\Askal Economy Editor"

:: Iniciar backend com auto-reload
echo 🔧 Iniciando backend com auto-reload...
start "Backend Auto-Reload" cmd /k "cd backend && nodemon server_v04.js"

:: Aguardar 3 segundos
timeout /t 3 /nobreak >nul

:: Iniciar frontend com auto-reload
echo 🎨 Iniciando frontend com auto-reload...
start "Frontend Hot Reload" cmd /k "cd frontend && npm start"

:: Aguardar 5 segundos
timeout /t 5 /nobreak >nul

:: Abrir navegador automaticamente
echo 🌐 Abrindo navegador...
start http://localhost:3000

echo.
echo ✅ Servidores iniciados!
echo.
echo 📝 COMO USAR:
echo   • Backend recarrega automaticamente quando você modifica arquivos .js
echo   • Frontend recarrega automaticamente quando você modifica arquivos React
echo   • Só precisa apertar F5 no navegador para ver mudanças
echo.
echo 🔧 Para modificar:
echo   • Backend: Edite arquivos em backend/
echo   • Frontend: Edite arquivos em frontend/src/
echo.
pause