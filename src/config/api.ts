// Rutas externas hacia el backend

// Configuración de la API 
const RAW_BASE = import.meta.env.VITE_API_URL; // 'http://localhost:5000'
const BASE_WITH_API = RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE}/api`;

export const API_CONFIG = {
  BASE_URL: BASE_WITH_API,
  
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
      RECURSOS: (eventoId: string | number) => `/eventos/${eventoId}/recursos`,
      LIST: '/events/public',
      CREATE: '/eventos',
      DETAIL: '/eventos',
      ATTENDED: '/events/attended',
      MANAGED: '/events/managed',
    },
    RECURSOS: {
      BASE: '/recursos',
      BY_ID: (id: string | number) => `/recursos/${id}`,
    },
    EVENTO: {
      COORDINATES: '/event/coordinates',
    },
    USUARIOS: {
      INVITACIONES: '/usuarios',
      NOTIFICACIONES: '/usuarios',
    }
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
    let errorData: any = {};
    let errorText = '';
    
    // Intentar parsear el JSON de error
    try {
      errorText = await response.text();
      if (errorText) {
        try {
          errorData = JSON.parse(errorText);
        } catch (parseError) {
          // Si no es JSON válido, usar el texto como mensaje
          errorData = { message: errorText };
        }
      }
    } catch (e) {
      // Si no se puede leer el texto, usar un objeto vacío
      errorData = {};
    }
    
    // Si es un error 401 (no autorizado), limpiar el token y redirigir al login
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      // Disparar evento personalizado para que el store reaccione
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
    
    // Construir el mensaje de error de forma segura
    const errorMessage = (errorData && typeof errorData === 'object' && errorData.message) 
      || (errorData && typeof errorData === 'object' && errorData.error)
      || errorText
      || `Error ${response.status}: ${response.statusText}`;
    
    throw new Error(String(errorMessage));
  }
  
  // Si la respuesta es exitosa, parsear el JSON
  try {
    return await response.json();
  } catch (e) {
    throw new Error('Error al parsear la respuesta del servidor');
  }
}
