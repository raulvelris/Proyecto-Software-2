import { ReactNode } from 'react'
import { confirmPublicAttendance } from '../service/PublicAttendanceService'

export interface PublicAttendancePayload {
  eventoId: number
  usuarioId: number
}

export async function performConfirmPublicAttendance({ eventoId, usuarioId }: PublicAttendancePayload) {
  return confirmPublicAttendance(eventoId, usuarioId)
}

interface PublicAttendanceActionsProps {
  children: ReactNode
}

export function PublicAttendanceActions({ children }: PublicAttendanceActionsProps) {
  return <>{children}</>
}
