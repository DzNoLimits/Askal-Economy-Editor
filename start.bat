@echo off
echo.
echo ==========================================
echo  🎮 Askal Economy Editor - DayZ
echo ==========================================
echo.

:: Verifica se Node.js está instalado
where node >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado. Instale antes de continuar.
    pause
    exit /b
)

:: Verifica se pasta backend existe
if not exist "%~dp0backend" (
    echo ERRO: Pasta 'backend' nao encontrada!
    pause
    exit /b
)

:: Verifica se pasta frontend existe
if not exist "%~dp0frontend" (
    echo ERRO: Pasta 'frontend' nao encontrada!
    pause
    exit /b
)

:: Novo: se for chamado com argumento "restart", executa rotina de reinicio
if /i "%~1"=="restart" goto :restartTool

echo Iniciando servidores...
echo.

call :startServers
goto :eof

:: --- BEGIN: Rotinas adicionadas para reinicio/stop/start ---
:restartTool
echo Reiniciando a ferramenta: parando processos nas portas 3001 e 3000...
call :stopPort 3001
call :stopPort 3000

echo Aguardando 3 segundos para garantir encerramento...
timeout /t 3 /nobreak >nul

echo Iniciando servidores depois do reinicio...
call :startServers
goto :eof

:stopPort
rem args: %1 = porta
setlocal
set "port=%~1"
echo Procurando processos que escutam na porta %port%...
set "found=0"
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%port%"') do (
    set "found=1"
    echo Matando PID %%p que usa a porta %port%...
    taskkill /PID %%p /F >nul 2>&1
)
if "%found%"=="0" echo Nenhum processo encontrado na porta %port%.
endlocal
goto :eof

:startServers
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
goto :eof
:: --- END: Rotinas adicionadas ---