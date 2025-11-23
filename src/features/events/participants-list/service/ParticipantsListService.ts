import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../../../../config/api.ts'

export type ParticipanteItem = {
  participante_id: number
  usuario_id: number
  correo: string
  nombre: string
  apellido: string
  rol: string
}

export async function getParticipantesByEvento(eventoId: number) {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}/eventos/${eventoId}/participantes`,
    { headers: getAuthHeaders() },
  )

  return handleApiResponse<{ success: boolean; participantes: ParticipanteItem[] }>(res)
}
