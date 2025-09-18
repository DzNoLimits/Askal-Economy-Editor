# DayZ Economy Editor - Auto Development Server
# Mantém localhost sempre online com auto-reload

Write-Host ""
Write-Host "🚀 DayZ Economy Editor - Development Mode" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

$projectPath = "c:\Users\Rocha\OneDrive\Desktop\Askal Economy Editor"
Set-Location $projectPath

Write-Host "🔧 Opções disponíveis:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Desenvolvimento Separado (Recomendado)" -ForegroundColor Yellow
Write-Host "   • Frontend: http://localhost:3000 (Hot Reload)" -ForegroundColor Gray
Write-Host "   • Backend:  http://localhost:3001 (Auto Reload)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Servidor Unificado" -ForegroundColor Yellow
Write-Host "   • Tudo em: http://localhost:3001" -ForegroundColor Gray
Write-Host "   • Precisa recompilar frontend para mudanças" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Escolha (1 ou 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "🚀 Iniciando modo desenvolvimento separado..." -ForegroundColor Green
    Write-Host ""
    
    # Iniciar backend
    Write-Host "🔧 Iniciando backend com nodemon..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath\backend'; Write-Host '🔧 Backend Auto-Reload (Porta 3001)' -ForegroundColor Green; nodemon server_v04.js"
    
    Start-Sleep -Seconds 3
    
    # Iniciar frontend
    Write-Host "🎨 Iniciando frontend com hot reload..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath\frontend'; Write-Host '🎨 Frontend Hot Reload (Porta 3000)' -ForegroundColor Blue; npm start"
    
    Start-Sleep -Seconds 8
    
    # Abrir navegador
    Write-Host "🌐 Abrindo navegador..." -ForegroundColor Green
    Start-Process "http://localhost:3000"
    
    Write-Host ""
    Write-Host "✅ Servidores iniciados!" -ForegroundColor Green
    Write-Host "📍 Acesse: http://localhost:3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 DICAS:" -ForegroundColor Cyan
    Write-Host "• Mudanças no frontend: Recarregam automaticamente" -ForegroundColor Gray
    Write-Host "• Mudanças no backend: Recarregam automaticamente" -ForegroundColor Gray
    Write-Host "• Só apertar F5 para ver as mudanças!" -ForegroundColor Gray

} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "🚀 Iniciando servidor unificado..." -ForegroundColor Green
    Write-Host ""
    
    # Compilar frontend
    Write-Host "📦 Compilando frontend..." -ForegroundColor Cyan
    Set-Location "$projectPath\frontend"
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend compilado com sucesso!" -ForegroundColor Green
        
        # Iniciar servidor unificado
        Set-Location "$projectPath\backend"
        Write-Host "🔧 Iniciando servidor unificado com auto-reload..." -ForegroundColor Cyan
        Write-Host "📍 URL: http://localhost:3001" -ForegroundColor Yellow
        Write-Host ""
        
        Start-Sleep -Seconds 2
        Start-Process "http://localhost:3001"
        
        nodemon server_unified.js
    } else {
        Write-Host "❌ Erro na compilação do frontend!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Opção inválida!" -ForegroundColor Red
}

Write-Host ""
Read-Host "Pressione Enter para sair"