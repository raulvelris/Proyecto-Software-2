@echo off
echo.
echo 🗺️  Configuracion de Google Maps API
echo =====================================
echo.

if exist ".env" (
    echo ✅ El archivo .env ya existe
    echo 📝 Verifica que contenga: VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
    echo.
) else (
    echo 📝 Creando archivo .env...
    echo # Google Maps API Key > .env
    echo # Para obtener tu API key: >> .env
    echo # 1. Ve a https://console.cloud.google.com/ >> .env
    echo # 2. Crea un nuevo proyecto o selecciona uno existente >> .env
    echo # 3. Habilita las siguientes APIs: >> .env
    echo #    - Maps JavaScript API >> .env
    echo #    - Places API >> .env
    echo #    - Geocoding API >> .env
    echo # 4. Crea credenciales (API Key) >> .env
    echo # 5. Reemplaza 'your_google_maps_api_key_here' con tu API key real >> .env
    echo. >> .env
    echo VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here >> .env
    echo ✅ Archivo .env creado exitosamente
    echo.
)

echo 📋 Proximos pasos:
echo 1. Ve a https://console.cloud.google.com/
echo 2. Crea un nuevo proyecto o selecciona uno existente
echo 3. Habilita las APIs: Maps JavaScript API, Places API, Geocoding API
echo 4. Crea una API Key
echo 5. Reemplaza 'your_google_maps_api_key_here' en el archivo .env con tu API key real
echo 6. Ejecuta: npm run dev
echo.
echo 📖 Para mas detalles, consulta GOOGLE_MAPS_SETUP.md
echo.
echo 🚀 Una vez configurado, la funcionalidad de ubicacion estara disponible en:
echo    - Crear evento ^> Ubicacion exacta
echo    - Busqueda con Google Maps
echo    - Ubicacion actual del usuario
echo.
pause
