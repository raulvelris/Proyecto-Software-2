import { API_CONFIG, handleApiResponse, getAuthHeaders } from '../../../config/api.ts'

export async function listPublicEvents() {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.LIST}`)
  return handleApiResponse<{ success: boolean; eventos: any[] }>(response)
}

export async function listAttendedEvents(usuarioId: number | string) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.ATTENDED}/${usuarioId}`,
    { headers: getAuthHeaders() }
  )
  return handleApiResponse<{ success: boolean; eventos: any[] }>(response)
}
