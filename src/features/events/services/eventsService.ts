// CADA UNO DEBE EN IR EN EL SERVICE QUE LE CORRESPONDE, QUE HACE AQUI ESTO?
import { API_CONFIG, handleApiResponse, getAuthHeaders } from '../../../config/api.ts'

export async function listPublicEvents(usuarioId?: number | string) {
  const url = usuarioId 
    ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.LIST}?usuarioId=${usuarioId}`
    : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.LIST}`
  const response = await fetch(url)
  return handleApiResponse<{ success: boolean; eventos: any[] }>(response)
}

export async function listAttendedEvents(usuarioId: number | string) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.ATTENDED}/${usuarioId}`,
    { headers: getAuthHeaders() }
  )
  return handleApiResponse<{ success: boolean; eventos: any[] }>(response)
}

export async function listManagedEvents() {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.MANAGED}`,
    { headers: getAuthHeaders() }
  )
  return handleApiResponse<{ success: boolean; eventos: any[] }>(response)
}

