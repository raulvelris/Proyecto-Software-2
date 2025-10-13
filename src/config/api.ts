// Rutas externas hacia el backend

// Configuración de la API 
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      ACTIVATE: '/auth/activate'
    },
    INVITACIONES: {
      SEARCH: '/invitations/search',
      SEND: '/invitations/send',
      RESPOND: '/invitations/respond',
      GET_NO_ELIGIBLE: '/invitations/no-eligible',
      COUNT: '/invitations/count'
    },
    EVENTOS: {
      LIST: '/events/public',
      CREATE: '/eventos',
      DETAIL: '/eventos',
    },
  },
} as const;

// Función helper para obtener headers con autenticación
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token'); // o desde tu store de Zustand
  
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

// Función helper para manejar respuestas de la API
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Si es un error 401 (no autorizado), limpiar el token y redirigir al login
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      // Disparar evento personalizado para que el store reaccione
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
