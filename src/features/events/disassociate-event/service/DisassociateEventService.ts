import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../../../../config/api.ts'

export async function desvincularme(eventoId: number, usuarioId: number) {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}/eventos/${eventoId}/desvincular-evento`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ usuario_id: usuarioId }),
    },
  )

  return handleApiResponse<{ success: boolean; message?: string }>(res)
}
