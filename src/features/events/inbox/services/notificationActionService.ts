import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../../../../config/api'

export type NotificationActionItem = {
  notificacion_accion_id: number | null
  fechaHora: string | null
  mensaje: string | null
  evento: {
    evento_id: number
    titulo: string | null
  } | null
}

export type GetNotificationActionsResponse = {
  success: boolean
  notificaciones_accion: NotificationActionItem[]
}

export async function getNotificationActions(/* usuarioId: number */): Promise<GetNotificationActionsResponse> {
  // The backend exposes this endpoint as GET /api/notifications-action and
  // uses the authenticated user (from the JWT) to determine the target user.
  const url = `${API_CONFIG.BASE_URL}/notifications-action`
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return handleApiResponse<GetNotificationActionsResponse>(res)
}