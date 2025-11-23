import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../../../../config/api.ts'

export async function eliminarInvitado(eventoId: number, usuarioId: number) {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}/eventos/${eventoId}/participantes/${usuarioId}/eliminar`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    },
  )

  return handleApiResponse<{ success: boolean; message?: string }>(res)
}
