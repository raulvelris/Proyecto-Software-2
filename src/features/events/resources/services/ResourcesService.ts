import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../../../../config/api';

type ListarRecursosResponse = {
  success: boolean;
  recursos: Recurso[];
};

export interface Recurso {
  id: number;
  nombre: string;
  url: string;
  tipo_recurso: {
    id: number;
    nombre: string;
  };
  evento_id: number;
  created_at?: string;
  updated_at?: string;
}

export const getRecursosByEvento = async (
  eventoId: number | string,
): Promise<Recurso[]> => {
  try {
    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      },
    );

    const data = await handleApiResponse<ListarRecursosResponse>(res);
    return Array.isArray(data.recursos) ? data.recursos : [];
  } catch (error) {
    console.error('Error al obtener los recursos del evento:', error);
    return [];
  }
};

export const createRecursoEnlace = async (
  eventoId: number,
  data: {
    nombre: string;
    url: string;
    tipo_recurso: string;
  },
): Promise<Recurso> => {
  try {
    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId)}/enlace`,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    return await handleApiResponse<Recurso>(res);
  } catch (error) {
    console.error('Error al crear el recurso (enlace):', error);
    throw error;
  }
};

export const eliminarRecurso = async (
  eventoId: number | string,
  recursoId: number,
): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId)}/${recursoId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    },
  );

  return handleApiResponse<{ success: boolean; message: string }>(res);
};

// Crear recurso de tipo ARCHIVO (FormData + multipart)
export const createRecursoArchivo = async (
  eventoId: number,
  formData: FormData,
): Promise<Recurso> => {
  try {
    const file = formData.get('archivo');
    if (!(file instanceof File)) {
      throw new Error('Debe proporcionar un archivo válido');
    }

    console.log('📤 Enviando archivo como FormData:', {
      nombre: formData.get('nombre'),
      tipo_recurso: formData.get('tipo_recurso'),
      archivo: file.name,
    });

    // No Content-Type
    const token = localStorage.getItem('auth_token');

    const res = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId)}/archivo`,
      {
        method: 'POST',
        body: formData,          
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        }
      }
    );

    return await handleApiResponse<Recurso>(res);
  } catch (error) {
    console.error('Error al crear el recurso (archivo):', error);
    throw error;
  }
};