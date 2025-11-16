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

// Crear recurso de tipo ENLACE (JSON normal, sin multipart)
export const createRecursoEnlace = async (
  eventoId: number,
  data: {
    nombre: string;
    url: string;
    tipo_recurso: string;
  }
): Promise<Recurso> => {
  try {
    const endpoint = API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId);
    console.log('📤 Enviando enlace como JSON:', data);
    return await apiService.post<Recurso>(endpoint, data);
  } catch (error) {
    console.error('Error al crear el recurso (enlace):', error);
    throw error;
  }
};

// Crear recurso de tipo ARCHIVO (FormData + multipart)
export const createRecursoArchivo = async (
  eventoId: number,
  formData: FormData
): Promise<Recurso> => {
  try {
    const endpoint = `${API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId)}/archivo`;
    
    const file = formData.get('archivo');
    if (!(file instanceof File)) {
      throw new Error('Debe proporcionar un archivo válido');
    }
    
    console.log('📤 Enviando archivo como FormData:', {
      nombre: formData.get('nombre'),
      tipo_recurso: formData.get('tipo_recurso'),
      archivo: file.name
    });
    
    return await apiService.uploadFile<Recurso>(
      endpoint,
      file,
      Object.fromEntries(formData.entries())
    );
  } catch (error) {
    console.error('Error al crear el recurso (archivo):', error);
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
