import { API_CONFIG, handleApiResponse, getAuthHeaders } from '../../../../config/api.ts'

export async function updateEvent(eventoId: string | number, eventData: any) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/eventos/update/${eventoId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(eventData),
    },
  )

  return handleApiResponse<{ success: boolean; evento: any }>(response)
}
