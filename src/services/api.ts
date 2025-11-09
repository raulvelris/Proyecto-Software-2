import { API_CONFIG, handleApiResponse } from '../config/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Añadir headers personalizados si existen
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (value) {
          headers[key] = value as string;
        }
      });
    }

    // Si hay un token de autenticación, lo añadimos a los headers
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Importante para las cookies de autenticación
    };

    try {
      const response = await fetch(url, config);
      return await handleApiResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Métodos HTTP
  public async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public async post<T>(
    endpoint: string, 
    data?: any, 
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  public async put<T>(
    endpoint: string, 
    data: any, 
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async delete<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Método para subir archivos
  public async uploadFile<T>(
    endpoint: string,
    file: File,
    data: Record<string, any> = {},
    options: RequestInit = {}
  ): Promise<T> {
    // Crear FormData y agregar el archivo con la clave 'archivo'
    const formData = new FormData();
    formData.append('archivo', file);

    // Añadir campos adicionales al FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Obtener el token de autenticación
    const token = localStorage.getItem('auth_token');
    
    // Crear headers
    const headers: Record<string, string> = {};
    
    // No establecer Content-Type, el navegador lo hará automáticamente con el boundary
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Hacer la petición directamente con fetch
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
      // Asegurarse de que no se agregue ningún header adicional automáticamente
      ...options,
    });
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al subir el archivo');
    }

    return handleApiResponse<T>(response);
  }
}

export const apiService = new ApiService();
