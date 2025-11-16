import { API_CONFIG, getAuthHeaders, handleApiResponse } from '../../../../config/api'

export type PrivateInvitationItem = {
  invitacion_usuario_id: number | null
  estado: string | null
  fechaLimite: string | null
  evento: {
    evento_id: number
    titulo: string | null
    fechaInicio: string | null
    fechaFin: string | null
  } | null
}

export type GetPrivateInvitationsResponse = {
  success: boolean
  invitaciones: PrivateInvitationItem[]
}

export async function getPrivateInvitations(/* usuarioId: number */): Promise<GetPrivateInvitationsResponse> {
  // The backend exposes this endpoint as GET /api/private-invitations and
  // derives the user from the authenticated token (req.user).
  const url = `${API_CONFIG.BASE_URL}/private-invitations`
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  })
  return handleApiResponse<GetPrivateInvitationsResponse>(res)
}

export async function acceptPrivateInvitation(invitacionUsuarioId: number) {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVITACIONES.RESPOND}`
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ invitacion_usuario_id: invitacionUsuarioId, accept: true }),
  })
  return handleApiResponse<{ success: boolean }>(res)
}

export async function rejectPrivateInvitation(invitacionUsuarioId: number) {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVITACIONES.RESPOND}`
  const res = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ invitacion_usuario_id: invitacionUsuarioId, accept: false }),
  })
  return handleApiResponse<{ success: boolean }>(res)
}
