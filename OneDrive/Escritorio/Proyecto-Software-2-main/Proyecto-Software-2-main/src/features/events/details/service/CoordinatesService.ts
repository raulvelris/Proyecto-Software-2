import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../../../../config/api.ts';

export async function getCoordenadas(id: number) {
  const res = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVENTOS.COORDINATES}/${id}`,
    { headers: getAuthHeaders() }
  );
  return handleApiResponse<{ success: boolean; coordenadas: any }>(res);
}
