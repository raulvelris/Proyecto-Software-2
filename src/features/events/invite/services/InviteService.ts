// InviteService.ts
import { UsuarioTipo } from '../../../../types/UsuarioTipo'
import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../../../../config/api'

export interface InvitacionResult {
  notificacion_id: number
  resultados: { 
    usuario_id: number | string; 
    status: string; 
    invitacion_usuario_id?: number;
    esParaCoorganizar?: boolean;
  }[]
}

export interface NoEligibleItem {
  usuario_id: number
  tipo: 'pendiente_asistente' | 'pendiente_coorganizador' | 'participante'
}

export interface ConteoPendiente {
  pendientesParaAsistente: number;
  limiteAsistentes: number;
  pendientesParaCoorganizador: number;
  limiteCoorganizadores: number;
}

// 1) buscar usuarios
export async function buscarUsuarios(query: string): Promise<UsuarioTipo[]> {
  if (!query.trim()) return []

  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVITACIONES.SEARCH}?query=${encodeURIComponent(query)}`,
      { method: 'GET', headers: getAuthHeaders() }
    )
    const data = await handleApiResponse<{ usuarios: UsuarioTipo[] }>(response)
    return data.usuarios || []
  } catch (error) {
    console.error('Error searching users:', error)
    throw new Error('Failed to search users')
  }
}

// 2) enviar invitación a uno o varios usuarios
export async function invitarUsuarios(
  eventId: number | string, 
  usuarios: {
    usuario_id: number | string,
    esParaCoorganizar: boolean
  }[]
): Promise<InvitacionResult> { // cambio: devuelve resultados
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVITACIONES.SEND}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          evento_id: eventId, 
          usuarios
        }),
      }
    )
    const data = await handleApiResponse<InvitacionResult>(response) // cambio: tipado correcto
    return data
  } catch (error) {
    console.error('Error sending invitations:', error)
    throw error
  }
}

// 3)  Obtener usuarios no elegibles
export async function obtenerNoElegibles(eventId: number | string): Promise<NoEligibleItem[]> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVITACIONES.GET_NO_ELIGIBLE}/${eventId}`,
        { method: 'GET', headers: getAuthHeaders() }
      )
      const data = await handleApiResponse<{ noElegibles: NoEligibleItem[] }>(response)
      return data.noElegibles || []
    } catch (error) {
      console.error('Error fetching non-eligible users:', error)
      throw new Error('Failed to fetch non-eligible users')
    }
  }

// 4) Obtener conteo de invitaciones pendientes por evento
export async function obtenerConteoPendientes(eventId: number | string): Promise<ConteoPendiente> {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVITACIONES.COUNT}/${eventId}`, 
        { method: 'GET', headers: getAuthHeaders() }
      )
      const data = await handleApiResponse<ConteoPendiente>(response)
      return data
    } catch (error) {
      console.error('Error fetching pending invitations count:', error)
      throw new Error('Failed to fetch pending invitations count')
    }
  }

