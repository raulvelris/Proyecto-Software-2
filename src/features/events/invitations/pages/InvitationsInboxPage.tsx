import React, { useEffect, useState } from 'react'
import EmptyState from '../../../../components/EmptyState'
import { useAuthStore } from '../../../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  getPrivateInvitations,
  acceptPrivateInvitation,
  rejectPrivateInvitation,
  type PrivateInvitationItem,
} from '../services/privateInvitationsService'

export default function InvitationsInboxPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [items, setItems] = useState<PrivateInvitationItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  async function load() {
    if (!user) return
    try {
      setLoading(true)
      const res = await getPrivateInvitations(Number(user.id))
      const onlyPending = (res.invitaciones ?? []).filter((it) => (it.estado ?? '').toLowerCase() === 'pendiente')
      setItems(onlyPending)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function onAccept(inv: PrivateInvitationItem) {
    const id = inv.invitacion_usuario_id
    if (id == null) return
    try {
      setSubmittingId(id)
      await acceptPrivateInvitation(id)
      setItems((prev) => prev.filter((x) => x.invitacion_usuario_id !== id))
      toast.success('Asistencia confirmada')
    } catch (e: any) {
      toast.error(e?.message || 'Ocurrió un error')
    } finally {
      setSubmittingId(null)
    }
  }

  async function onReject(inv: PrivateInvitationItem) {
    const id = inv.invitacion_usuario_id
    if (id == null) return
    try {
      setSubmittingId(id)
      await rejectPrivateInvitation(id)
      setItems((prev) => prev.filter((x) => x.invitacion_usuario_id !== id))
      toast.success('Invitación rechazada')
    } catch (e: any) {
      toast.error(e?.message || 'Ocurrió un error')
    } finally {
      setSubmittingId(null)
    }
  }

  function onViewDetail(inv: PrivateInvitationItem) {
    const eventId = inv.evento?.evento_id
    if (eventId == null) return
    navigate(`/eventos/${eventId}`)
  }

  if (loading) {
    return <div className="text-sm text-slate-500">Cargando...</div>
  }

  if (!items.length) {
    return <EmptyState title="No tienes invitaciones" description="Aún no tienes invitaciones privadas." />
  }

  return (
    <div className="space-y-3">
      {items.map((inv) => {
        const title = inv.evento?.titulo ?? 'Evento sin título'
        const start = inv.evento?.fechaInicio ? new Date(inv.evento.fechaInicio) : null
        const end = inv.evento?.fechaFin ? new Date(inv.evento.fechaFin) : null
        const eventDate = start && end
          ? `${start.toLocaleString()} – ${end.toLocaleString()}`
          : start
          ? start.toLocaleString()
          : end
          ? end.toLocaleString()
          : 'Sin fecha'
        const estado = inv.estado ?? 'desconocido'
        const limiteDate = inv.fechaLimite ? new Date(inv.fechaLimite) : null
        const limite = limiteDate ? limiteDate.toLocaleString() : '—'
        const expired = !!limiteDate && limiteDate.getTime() < Date.now()
        const disabled = submittingId === inv.invitacion_usuario_id || expired
        return (
          <div key={inv.invitacion_usuario_id ?? Math.random()} className="card p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-slate-400">{eventDate}</p>
                <p className="text-xs text-slate-500">Estado: {estado}{expired ? ' (expirada)' : ''} · Fecha límite: {limite}</p>
              </div>
              {expired ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                  Expirada
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400"
                    onClick={() => onViewDetail(inv)}
                  >
                    Ver detalle
                  </button>
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={disabled || inv.invitacion_usuario_id == null}
                      onClick={() => onAccept(inv)}
                    >
                      {disabled ? 'Confirmando...' : 'Confirmar'}
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400 disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={disabled || inv.invitacion_usuario_id == null}
                      onClick={() => onReject(inv)}
                    >
                      {disabled ? 'Rechazando...' : 'Rechazar'}
                    </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
