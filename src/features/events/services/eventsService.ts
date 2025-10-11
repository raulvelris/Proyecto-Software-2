import { API_CONFIG, handleApiResponse } from '../../../config/api'

export async function listPublicEvents() {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.LIST}`)
  return handleApiResponse<{ success: boolean; eventos: any[] }>(response)
}
