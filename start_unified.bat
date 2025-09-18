@echo off
echo 🏗️ Building unified DayZ Economy Editor...
echo.

echo 📦 Step 1: Building React frontend...
cd frontend
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo ✅ Frontend built successfully!
echo.

echo 🚀 Step 2: Starting unified server...
cd ..\backend
node server_unified.js

pause