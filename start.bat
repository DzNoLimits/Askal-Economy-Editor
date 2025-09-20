@echo off
:: --- BEGIN: Menu de opções (adicionado) ---
echo.
echo ==========================================
echo  🎮 Askal Economy Editor - DayZ
echo ==========================================
echo.
echo Escolha uma opcao:
echo   1) Iniciar servidores (padrão)
echo   2) Limpar workspace (faxina)
echo   3) Limpar e iniciar servidores
set /p userChoice=Digite 1, 2 ou 3 e pressione Enter (default 1): 
if "%userChoice%"=="" set userChoice=1
echo.

if "%userChoice%"=="2" goto cleanupOnly
if "%userChoice%"=="3" goto cleanupAndStart
:: fallback: proceed to start servers
:: --- END: Menu de opções ---

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
goto :eof

:: --- BEGIN: Rotina de limpeza (adicionada) ---
:cleanupOnly
call :confirmAndCleanup
echo.
echo Limpeza concluida.
pause
goto :eof

:cleanupAndStart
call :confirmAndCleanup
echo.
echo Iniciando servidores apos limpeza...
echo.
:: depois da limpeza, continua com a rotina original de inicio
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

:confirmAndCleanup
set /p confirm=Tem certeza que deseja limpar o workspace? Isso removera node_modules, builds e caches nas pastas frontend/backend. (S/N): 
if /i not "%confirm%"=="S" if /i not "%confirm%"=="s" (
    echo Cancelado pelo usuario.
    goto :eof
)
echo Iniciando limpeza...
call :doCleanup
goto :eof

:doCleanup
set "ROOT=%~dp0"
echo ROOT = %ROOT%

rem Backend
if exist "%ROOT%backend\node_modules" (
    echo Removendo backend\node_modules...
    rmdir /s /q "%ROOT%backend\node_modules"
) else echo backend\\node_modules nao encontrado.

if exist "%ROOT%backend\dist" (
    echo Removendo backend\\dist...
    rmdir /s /q "%ROOT%backend\dist"
)

if exist "%ROOT%backend\build" (
    echo Removendo backend\\build...
    rmdir /s /q "%ROOT%backend\build"
)

rem Frontend
if exist "%ROOT%frontend\node_modules" (
    echo Removendo frontend\node_modules...
    rmdir /s /q "%ROOT%frontend\node_modules"
) else echo frontend\\node_modules nao encontrado.

if exist "%ROOT%frontend\build" (
    echo Removendo frontend\\build...
    rmdir /s /q "%ROOT%frontend\build"
)

if exist "%ROOT%frontend\dist" (
    echo Removendo frontend\\dist...
    rmdir /s /q "%ROOT%frontend\dist"
)

rem caches e logs comuns
if exist "%ROOT%backend\npm-debug.log" del /f /q "%ROOT%backend\npm-debug.log"
if exist "%ROOT%frontend\npm-debug.log" del /f /q "%ROOT%frontend\npm-debug.log"

rem tentar npm cache verify se npm instalado
where npm >nul 2>&1
if %errorlevel%==0 (
    echo Executando "npm cache verify"...
    npm cache verify
) else echo npm nao encontrado no PATH; pulando verificacao de cache.

rem opcional: usar git clean se desejado e git instalado (NAO executa por padrao; descomentear se quiser)
:: where git >nul 2>&1
:: if %errorlevel%==0 (
::     echo Executando git clean -fdx nas pastas frontend e backend...
::     pushd "%ROOT%frontend" && git clean -fdx || popd
::     pushd "%ROOT%backend" && git clean -fdx || popd
:: )

echo Limpeza finalizada.
goto :eof
:: --- END: Rotina de limpeza ---