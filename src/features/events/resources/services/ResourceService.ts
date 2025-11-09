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

export const createRecurso = async (formData: FormData): Promise<Recurso> => {
  try {
    const eventoId = formData.get('evento_id');
    if (!eventoId) {
      throw new Error('ID de evento no proporcionado');
    }

    // Obtener el archivo si existe
    const file = formData.get('archivo');
    
    // Si es un archivo, usamos el endpoint de subida de archivos
    if (file instanceof File) {
      // Crear un nuevo FormData para asegurar que los datos estén en el formato correcto
      const uploadData = new FormData();
      uploadData.append('archivo', file);
      uploadData.append('nombre', formData.get('nombre')?.toString() || '');
      uploadData.append('tipo_recurso', '2'); // 2 para archivo
      uploadData.append('evento_id', eventoId.toString());
      
      // Si es un enlace, agregar la URL
      const url = formData.get('url')?.toString();
      if (url) {
        uploadData.append('url', url);
      }
      
      const eventIdStr = eventoId.toString();
      return await apiService.uploadFile<Recurso>(
        API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventIdStr),
        file,
        Object.fromEntries(uploadData.entries())
      );
    } else {
      // Si no hay archivo, es un enlace
      return await apiService.post<Recurso>(
        API_CONFIG.ENDPOINTS.RECURSOS.BASE,
        Object.fromEntries(formData.entries())
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
