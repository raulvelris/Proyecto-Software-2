import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../../../../config/api';

export async function getEventoDetalle(id: number) {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.DETAIL}/${id}`,
    { headers: getAuthHeaders() }
  );
  return handleApiResponse<{ success: boolean; evento: any }>(res);
}

export async function confirmPublicAttendance(eventoId: number, usuarioId: number) {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.DETAIL}/${eventoId}/attendance/public`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ usuario_id: usuarioId }),
    }
  );
  return handleApiResponse<{ success: boolean }>(res);
}
