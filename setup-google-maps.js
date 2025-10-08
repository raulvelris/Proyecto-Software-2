#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗺️  Configuración de Google Maps API');
console.log('=====================================\n');

// Verificar si ya existe .env
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('✅ El archivo .env ya existe');
  console.log('📝 Verifica que contenga: VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui\n');
} else {
  console.log('📝 Creando archivo .env...');
  
  const envContent = `# Google Maps API Key
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
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Archivo .env creado exitosamente');
  } catch (error) {
    console.log('❌ Error creando archivo .env:', error.message);
    console.log('📝 Crea manualmente un archivo .env con el siguiente contenido:');
    console.log(envContent);
  }
}

console.log('\n📋 Próximos pasos:');
console.log('1. Ve a https://console.cloud.google.com/');
console.log('2. Crea un nuevo proyecto o selecciona uno existente');
console.log('3. Habilita las APIs: Maps JavaScript API, Places API, Geocoding API');
console.log('4. Crea una API Key');
console.log('5. Reemplaza "your_google_maps_api_key_here" en el archivo .env con tu API key real');
console.log('6. Ejecuta: npm run dev');
console.log('\n📖 Para más detalles, consulta GOOGLE_MAPS_SETUP.md');
