# Configuración de Google Maps API

## Pasos para configurar la API key:

### 1. Crear archivo .env
Crea un archivo `.env` en la raíz del proyecto (Proyecto-Software-2/) con el siguiente contenido:

```
VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

### 2. Obtener API Key de Google Maps

#### Paso 1: Ir a Google Cloud Console
- Ve a [Google Cloud Console](https://console.cloud.google.com/)
- Inicia sesión con tu cuenta de Google

#### Paso 2: Crear o seleccionar proyecto
- Crea un nuevo proyecto o selecciona uno existente
- Anota el nombre del proyecto

#### Paso 3: Habilitar APIs necesarias
Ve a "APIs y servicios" > "Biblioteca" y habilita:
- **Maps JavaScript API**
- **Places API**
- **Geocoding API**

#### Paso 4: Crear credenciales
- Ve a "APIs y servicios" > "Credenciales"
- Haz clic en "Crear credenciales" > "Clave de API"
- Copia la API key generada

#### Paso 5: Configurar restricciones (Recomendado)
- Haz clic en la API key creada
- En "Restricciones de aplicación", selecciona "Sitios web HTTP"
- Agrega tu dominio (ej: `localhost:5173`, `tu-dominio.com`)

### 3. Configurar el archivo .env
Reemplaza `tu_api_key_aqui` con tu API key real:

```
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4. Reiniciar el servidor
Después de crear el archivo .env, reinicia el servidor de desarrollo:

```bash
npm run dev
```

## Funcionalidades disponibles:

✅ **Búsqueda de ubicaciones**: Los usuarios pueden buscar direcciones usando Google Places API
✅ **Geolocalización**: Los usuarios pueden usar su ubicación actual
✅ **Coordenadas precisas**: Se obtienen latitud y longitud exactas
✅ **Validación de direcciones**: Google Maps valida las direcciones ingresadas

## Solución de problemas:

### Error: "Google Maps API not loaded"
- Verifica que la API key esté correcta en el archivo .env
- Asegúrate de que las APIs estén habilitadas en Google Cloud Console
- Verifica que no haya restricciones de dominio bloqueando localhost

### Error: "Location not found"
- Verifica que Places API esté habilitada
- Asegúrate de que la API key tenga permisos para Places API

### Error: "Geolocation is not supported"
- El navegador debe soportar geolocalización
- El usuario debe permitir el acceso a la ubicación
