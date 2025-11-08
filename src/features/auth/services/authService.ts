import { API_CONFIG } from '../../../config/api'

export interface RegisterData {
  nombre: string
  apellido: string
  correo: string
  clave: string
}

export interface RegisterResponse {
  success: boolean
  message: string
  data: {
    usuario_id: number
    correo: string
    nombre: string
    apellido: string
    isActive: boolean
  }
}

export interface ActivateResponse {
  success: boolean
  message: string
  expired?: boolean
  data?: {
    usuario_id: number
    correo: string
    nombre: string
    apellido: string
    isActive: boolean
  }
}

/**
 * Registra un nuevo usuario en el backend
 */
export async function registerUser(data: RegisterData): Promise<RegisterResponse> {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Error al registrar usuario')
  }

  return result
}

export interface LoginResponse {
  success: boolean
  user: {
    usuario_id: number
    correo: string
    nombre: string | null
    apellido: string | null
    foto_perfil?: string | null
  }
  token: string
}

export async function login(correo: string, clave: string): Promise<LoginResponse> {
  const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ correo, clave }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Error al iniciar sesión')
  }

  return result
}

/**
 * Activa la cuenta de usuario con el token
 */
export async function activateAccount(token: string): Promise<ActivateResponse> {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.ACTIVATE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || 'Error al activar cuenta')
  }

  return result
}
