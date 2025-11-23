import { API_CONFIG, handleApiResponse, getAuthHeaders } from '../../../../config/api.ts'

export async function deleteEvent(eventoId: string | number) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.DELETE}/${eventoId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    },
  )

  return handleApiResponse<{ success: boolean }>(response)
}
