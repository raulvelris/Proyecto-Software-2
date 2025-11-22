import { API_CONFIG, handleApiResponse, getAuthHeaders } from '../../../config/api.ts'

export async function listPublicEvents() {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.PUBLIC}`,
    { headers: getAuthHeaders() }
  )
  return handleApiResponse<{ success: boolean; eventos: any[] }>(response)
}

export async function listAttendedEvents() {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.ATTENDED}`,
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

export async function deleteEvent(eventoId: string | number) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.DELETE}/${eventoId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders()
    }
  )
  return handleApiResponse<{ success: boolean }>(response)
}

export async function updateEvent(eventoId: string | number, eventData: any) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}/eventos/update/${eventoId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(eventData)
    }
  )
  return handleApiResponse<{ success: boolean; evento: any }>(response)
}

