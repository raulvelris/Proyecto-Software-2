import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../../../../config/api.ts';

export async function getEventoDetalle(id: number) {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.DETAIL}/${id}`,
    { headers: getAuthHeaders() }
  );
  return handleApiResponse<{ success: boolean; evento: any }>(res);
}