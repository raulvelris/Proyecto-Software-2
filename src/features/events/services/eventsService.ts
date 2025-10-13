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

export async function listManagedEvents(usuarioId: number | string) {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.MANAGED}/${usuarioId}`,
    { headers: getAuthHeaders() }
  )
  return handleApiResponse<{ success: boolean; eventos: any[] }>(response)
}

export async function createEvent(payload: {
  name: string
  date: string
  capacity: number
  description?: string
  ownerId: string | number
  privacy?: 'public' | 'private'
  locationAddress: string
  imageUrl: string
  lat: number
  lng: number
}) {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.CREATE}` , {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  return handleApiResponse<{ success: boolean; evento: { id: number } }>(response)
}
