import { UsuarioTipo } from '../../../../types/UsuarioTipo'
import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../../../../config/api'

// 1) buscar usuarios por email o username
export async function buscarUsuarios(query: string): Promise<UsuarioTipo[]> {
    if (!query.trim()) {
        return [];
    }

    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USUARIOS.SEARCH}?query=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                headers: getAuthHeaders(),
            }
        );

        const data = await handleApiResponse<{ usuarios: UsuarioTipo[] }>(response);
        return data.usuarios || [];
    } catch (error) {
        console.error('Error searching users:', error);
        throw new Error('Failed to search users');
    }
}

// 2) enviar invitación
export async function invitarUsuario(eventId: number | string, usuarioId: number | string): Promise<void> {
    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVITACIONES.SEND}`,
            {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    evento_id: eventId,
                    usuario_id: usuarioId,
                }),
            }
        );

        const data = await handleApiResponse<{ message: string; invitacion_id: number }>(response);
        console.log('Invitation sent successfully:', data);
    } catch (error) {
        console.error('Error sending invitation:', error);
        throw error;
    }
}