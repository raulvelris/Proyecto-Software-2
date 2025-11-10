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

    // El backend siempre requiere el campo 'url'
    // Para enlaces: usar la URL proporcionada
    // Para archivos: usar el nombre del archivo o una URL vacía
    if (url) {
      requestData.append('url', url);
    } else if (archivo instanceof File) {
      requestData.append('url', archivo.name);
    }
    
    // Si es un archivo, agregar el archivo
    if (tipoRecurso === '2' && archivo instanceof File) {
      requestData.append('archivo', archivo);
    }

    // Usar el endpoint correcto para crear el recurso
    // No establecer Content-Type manualmente - el navegador lo hará automáticamente con el boundary correcto
    const response = await apiService.post<{ success: boolean; recurso_id?: number; recurso?: Recurso; message?: string }>(
      API_CONFIG.ENDPOINTS.EVENTOS.RECURSOS(eventoId.toString()),
      requestData
    );

    console.log('📥 Respuesta del servidor al crear recurso:', response);

    // El backend devuelve recurso_id, no el objeto completo
    // Necesitamos construir un objeto temporal o refrescar la lista
    if (!response || !response.success) {
      throw new Error('Error al crear el recurso en el servidor');
    }

    // Si el backend devuelve recurso_id, construir un objeto temporal
    if (response.recurso_id) {
      return {
        id: response.recurso_id,
        nombre,
        url: url || '',
        tipo_recurso: {
          id: parseInt(tipoRecurso),
          nombre: tipoRecurso === '1' ? 'Enlace' : 'Archivo'
        },
        evento_id: parseInt(eventoId.toString())
      };
    }

    // Si devuelve el objeto completo (recurso), usarlo
    if (response.recurso) {
      return response.recurso;
    }

    throw new Error('Formato de respuesta inesperado al crear el recurso');
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
