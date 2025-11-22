# Integración Frontend-Backend

## ✅ Cambios Realizados

### 1. **Configuración de API** (`src/config/api.ts`)
- Agregado endpoint `AUTH.REGISTER` para registro de usuarios
- Agregado endpoint `AUTH.ACTIVATE` para activación de cuentas
- Base URL configurada: `http://localhost:5000/api`

### 2. **Servicio de Autenticación** (`src/features/auth/services/authService.ts`)
- `registerUser()`: Registra un nuevo usuario en el backend
- `activateAccount()`: Activa la cuenta con el token del email

### 3. **Página de Registro** (`src/features/auth/pages/RegisterPage.tsx`)
- Actualizada para usar el backend real
- Campos: nombre, apellido, correo, contraseña
- Validación con Zod
- Envía datos al endpoint `/api/auth/register`

### 4. **Página de Activación** (`src/features/auth/pages/ActivateAccountPage.tsx`)
- Nueva página para activar cuenta con token
- Ruta: `/activate/:token`
- Estados: loading, success, error
- Redirección automática al login tras activación exitosa

### 5. **Router** (`src/router/index.tsx`)
- Agregada ruta `/activate/:token` para activación de cuentas

## 🚀 Cómo Probar

### 1. Iniciar el Backend
```bash
cd backend
npm run dev
```
El backend debe estar corriendo en `http://localhost:5000`

### 2. Iniciar el Frontend
```bash
cd PIS2-v2
npm install  # Si es la primera vez
npm run dev
```
El frontend correrá en `http://localhost:5173` (o el puerto que Vite asigne)

### 3. Flujo de Registro y Activación

1. **Registrarse**:
   - Ve a `http://localhost:5173/register`
   - Completa el formulario con:
     - Nombre
     - Apellido
     - Correo electrónico
     - Contraseña (mínimo 6 caracteres)
   - Click en "Crear cuenta"

2. **Revisar Email**:
   - El backend enviará un email real al correo proporcionado
   - El email contiene un enlace de activación con el token

3. **Activar Cuenta**:
   - Click en el enlace del email (formato: `http://localhost:3000/activate/{token}`)
   - O copia el token y ve a `http://localhost:5173/activate/{token}`
   - La cuenta se activará automáticamente

4. **Iniciar Sesión**:
   - Después de activar, serás redirigido al login
   - Usa tu correo y contraseña para entrar

## 📧 Configuración de Email

El backend debe tener configurado Gmail SMTP en el archivo `.env`:

```env
NODE_ENV=production  # Para enviar emails reales
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicación-de-gmail
FRONTEND_URL=http://localhost:5173
```

## 🔧 Variables de Entorno

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (`.env`)
```env
PORT=5000
NODE_ENV=production
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicación
FRONTEND_URL=http://localhost:5173
```

## 📝 Estructura de Datos

### Request - Registro
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "correo": "juan@ejemplo.com",
  "clave": "123456"
}
```

### Response - Registro
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Por favor, revisa tu correo para activar tu cuenta.",
  "data": {
    "usuario_id": 9,
    "correo": "juan@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "isActive": false
  }
}
```

### Request - Activación
```json
{
  "token": "abc123xyz456"
}
```

### Response - Activación
```json
{
  "success": true,
  "message": "Cuenta activada exitosamente",
  "data": {
    "usuario_id": 9,
    "correo": "juan@ejemplo.com",
    "nombre": "Juan",
    "apellido": "Pérez",
    "isActive": true
  }
}
```

## ⚠️ Notas Importantes

1. **CORS**: El backend debe tener CORS habilitado para `http://localhost:5173`
2. **Token de Activación**: Válido por 24 horas
3. **Email Real**: Se envía un email real al correo proporcionado
4. **Contraseñas**: Actualmente se guardan en texto plano (TODO: implementar bcrypt)

## 🐛 Troubleshooting

### El email no llega
- Verifica la configuración SMTP en el backend
- Revisa la carpeta de SPAM
- Confirma que `NODE_ENV=production` en el backend

### Error de CORS
- Verifica que el backend tenga CORS configurado
- URL del frontend debe ser `http://localhost:5173`

### Token inválido
- El token expira en 24 horas
- Registra un nuevo usuario si el token expiró
