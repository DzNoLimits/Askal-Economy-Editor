@echo off
echo.
echo ==========================================
echo  🎮 Askal Economy Editor - DayZ
echo ==========================================
echo.
echo Iniciando servidores...
echo.

echo 📡 Iniciando Backend (porta 3001)...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak >nul

echo 🌐 Iniciando Frontend (porta 3000)...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo ✅ Servidores iniciados!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 📡 Backend:  http://localhost:3001
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

start http://localhost:3000

echo.
echo 🚀 Editor aberto no navegador!
echo Feche esta janela quando terminar de usar.
echo.
pause