import { API_CONFIG, handleApiResponse, getAuthHeaders } from '../../../../config/api.ts'

export async function listManagedEvents() {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.MANAGED}`,
    { headers: getAuthHeaders() }
  )
  return handleApiResponse<{ success: boolean; eventos: any[] }>(response)
}