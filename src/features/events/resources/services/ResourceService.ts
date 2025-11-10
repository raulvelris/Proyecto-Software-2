import { apiService } from '../../../../services/api';
import { API_CONFIG } from '../../../../config/api';

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

export const getRecursosByEvento = async (eventoId: number): Promise<Recurso[]> => {
  try {
    const response = await apiService.get<Recurso[]>(
      API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId)
    );
    return response;
  } catch (error) {
    console.error('Error al obtener los recursos del evento:', error);
    throw error;
  }
};

export const createRecurso = async (data: FormData | {
  nombre: string;
  url: string;
  tipo_recurso: number;
  evento_id: string;
}): Promise<Recurso> => {
  try {
    let eventoId: string;
    let requestData: any;

    // Si es FormData (archivo), procesarlo
    if (data instanceof FormData) {
      eventoId = data.get('evento_id')?.toString() || '';
      if (!eventoId) {
        throw new Error('ID de evento no proporcionado');
      }
      
      return await apiService.post<Recurso>(
        API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId),
        data
      );
    } else {
      // Si es un objeto (enlace), enviarlo directamente como JSON
      eventoId = data.evento_id;
      if (!eventoId) {
        throw new Error('ID de evento no proporcionado');
      }

      requestData = {
        nombre: data.nombre,
        url: data.url,
        tipo_recurso: data.tipo_recurso
      };

      return await apiService.post<Recurso>(
        API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId),
        requestData
      );
    }
  } catch (error) {
    console.error('Error al crear el recurso:', error);
    throw error;
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
