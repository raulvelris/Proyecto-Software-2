# Script de configuración de Google Maps API
# Ejecuta este script para configurar automáticamente la API key

Write-Host "🗺️  Configuración de Google Maps API" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si ya existe .env
if (Test-Path ".env") {
    Write-Host "✅ El archivo .env ya existe" -ForegroundColor Green
    Write-Host "📝 Verifica que contenga: VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "📝 Creando archivo .env..." -ForegroundColor Yellow
    
    $envContent = @"
# Google Maps API Key
# Para obtener tu API key:
# 1. Ve a https://console.cloud.google.com/
# 2. Crea un nuevo proyecto o selecciona uno existente
# 3. Habilita las siguientes APIs:
#    - Maps JavaScript API
#    - Places API  
#    - Geocoding API
# 4. Crea credenciales (API Key)
# 5. Reemplaza 'your_google_maps_api_key_here' con tu API key real

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
"@

    try {
        $envContent | Out-File -FilePath ".env" -Encoding UTF8
        Write-Host "✅ Archivo .env creado exitosamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error creando archivo .env: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "📝 Crea manualmente un archivo .env con el siguiente contenido:" -ForegroundColor Yellow
        Write-Host $envContent
    }
}

Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Ve a https://console.cloud.google.com/" -ForegroundColor White
Write-Host "2. Crea un nuevo proyecto o selecciona uno existente" -ForegroundColor White
Write-Host "3. Habilita las APIs: Maps JavaScript API, Places API, Geocoding API" -ForegroundColor White
Write-Host "4. Crea una API Key" -ForegroundColor White
Write-Host "5. Reemplaza 'your_google_maps_api_key_here' en el archivo .env con tu API key real" -ForegroundColor White
Write-Host "6. Ejecuta: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 Para más detalles, consulta GOOGLE_MAPS_SETUP.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Una vez configurado, la funcionalidad de ubicación estará disponible en:" -ForegroundColor Green
Write-Host "   - Crear evento > Ubicación exacta" -ForegroundColor White
Write-Host "   - Búsqueda con Google Maps" -ForegroundColor White
Write-Host "   - Ubicación actual del usuario" -ForegroundColor White
