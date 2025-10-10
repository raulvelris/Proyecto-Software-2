// Rutas externas hacia el backend

// Configuración de la API 
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // Endpoints
  ENDPOINTS: {
    USUARIOS: {
    },
    INVITACIONES: {
      SEARCH: '/invitations/search',
      SEND: '/invitations/send',
      RESPOND: '/invitations/respond',
      GET_NO_ELIGIBLE: '/invitations/no-eligible',
      COUNT: '/invitations/count'
    },
    EVENTOS: {
      LIST: '/eventos',
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
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}
