@echo off
echo ==================================================
echo   Faxina: limpar node_modules, builds e caches
echo ==================================================
echo.

set /p confirm=Tem certeza que deseja limpar o workspace? (S/N): 
if /i not "%confirm%"=="S" if /i not "%confirm%"=="s" (
    echo Cancelado pelo usuario.
    exit /b 1
)

set "ROOT=%~dp0"
echo ROOT = %ROOT%

rem Backend
if exist "%ROOT%backend\node_modules" (
    echo Removendo backend\node_modules...
    rmdir /s /q "%ROOT%backend\node_modules"
) else echo backend\\node_modules nao encontrado.

if exist "%ROOT%backend\dist" rmdir /s /q "%ROOT%backend\dist"
if exist "%ROOT%backend\build" rmdir /s /q "%ROOT%backend\build"

rem Frontend
if exist "%ROOT%frontend\node_modules" (
    echo Removendo frontend\node_modules...
    rmdir /s /q "%ROOT%frontend\node_modules"
) else echo frontend\\node_modules nao encontrado.

if exist "%ROOT%frontend\build" rmdir /s /q "%ROOT%frontend\build"
if exist "%ROOT%frontend\dist" rmdir /s /q "%ROOT%frontend\dist"

rem logs
if exist "%ROOT%backend\npm-debug.log" del /f /q "%ROOT%backend\npm-debug.log"
if exist "%ROOT%frontend\npm-debug.log" del /f /q "%ROOT%frontend\npm-debug.log"

where npm >nul 2>&1
if %errorlevel%==0 (
    echo Executando "npm cache verify"...
    npm cache verify
) else echo npm nao encontrado no PATH; pulando verificacao de cache.

echo.
echo Limpeza concluida.
pause
