import { apiService } from '../../../services/api';
import { API_CONFIG } from '../../../config/api';

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

export const getRecursosByEvento = async (eventoId: number | string): Promise<Recurso[]> => {
  try {
    const response = await apiService.get<{ success: boolean; recursos: Recurso[] }>(
      API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId)
    );
    // Aseguramos que siempre devolvamos un array, incluso si la respuesta no es la esperada
    return Array.isArray(response?.recursos) ? response.recursos : [];
  } catch (error) {
    console.error('Error al obtener los recursos del evento:', error);
    return []; // Devolvemos un array vacío en caso de error para prevenir fallos
  }
};

export const createRecurso = async (formData: FormData): Promise<Recurso> => {
  try {
    const eventoId = formData.get('evento_id');
    if (!eventoId) {
      throw new Error('ID de evento no proporcionado');
    }

    // Obtener los datos del formulario
    const nombre = formData.get('nombre')?.toString() || '';
    const tipoRecurso = formData.get('tipo_recurso')?.toString() || '1'; // 1 para enlace por defecto
    const url = formData.get('url')?.toString();
    const archivo = formData.get('archivo');

    // Crear un nuevo FormData para la petición
    const requestData = new FormData();
    requestData.append('nombre', nombre);
    requestData.append('tipo_recurso', tipoRecurso);
    requestData.append('evento_id', eventoId.toString());

    // Si es un enlace, agregar la URL
    if (tipoRecurso === '1' && url) {
      requestData.append('url', url);
    }
    
    // Si es un archivo, agregar el archivo
    if (tipoRecurso === '2' && archivo instanceof File) {
      requestData.append('archivo', archivo);
    }

    // Usar el endpoint correcto para crear el recurso
    const response = await apiService.post<{ success: boolean; recurso: Recurso }>(
      API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId.toString()),
      requestData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // Verificar si la respuesta tiene la estructura esperada
    if (!response || !response.recurso) {
      throw new Error('Formato de respuesta inesperado al crear el recurso');
    }

    return response.recurso;
  } catch (error) {
    console.error('Error al crear el recurso:', error);
    throw new Error(error instanceof Error ? error.message : 'Error desconocido al crear el recurso');
  }
};

export const deleteRecurso = async (recursoId: number): Promise<void> => {
  try {
    await apiService.delete(API_CONFIG.ENDPOINTS.RECURSOS.BY_ID(recursoId));
  } catch (error) {
    console.error('Error al eliminar el recurso:', error);
    throw error;
  }
};
