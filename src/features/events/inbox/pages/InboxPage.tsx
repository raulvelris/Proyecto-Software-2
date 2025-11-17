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
import {
  getNotificationActions,
  type NotificationActionItem,
} from '../services/notificationActionService'

type CombinedItem = 
  | (PrivateInvitationItem & { tipo: 'invitacion' })
  | (NotificationActionItem & { tipo: 'notificacion' })

export default function InboxPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [items, setItems] = useState<CombinedItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  async function load() {
    if (!user) return
    try {
      setLoading(true)

      const [invRes, notifRes] = await Promise.all([
        getPrivateInvitations(),
        getNotificationActions()
      ])

      const onlyPendingInv = (invRes.invitaciones ?? [])
        .filter((it) => (it.estado ?? '').toLowerCase() === 'pendiente')
        .map((it) => ({ ...it, tipo: 'invitacion' as const }))

      const notifItems = (notifRes.notificaciones_accion ?? [])
        .map((it) => ({ ...it, tipo: 'notificacion' as const }))

      // Combinar ambas listas
      let combined = [...onlyPendingInv, ...notifItems]

      // Filtrar últimos 14 días
      const cutoff = Date.now() - 14 * 24 * 60 * 60 * 1000
      combined = combined.filter((item) => {
        const fecha = new Date(
          item.tipo === 'invitacion' ? item.evento?.fechaInicio ?? '' : item.fechaHora ?? ''
        ).getTime()
        return !isNaN(fecha) && fecha >= cutoff
      })

      // Ordenar por fecha descendente
      combined.sort((a, b) => {
        const fechaA = new Date(
          a.tipo === 'invitacion' ? a.evento?.fechaInicio ?? '' : a.fechaHora ?? ''
        ).getTime()
        const fechaB = new Date(
          b.tipo === 'invitacion' ? b.evento?.fechaInicio ?? '' : b.fechaHora ?? ''
        ).getTime()
        return fechaB - fechaA
      })

      setItems(combined)
    } catch (e: any) {
      toast.error(e?.message || 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      load()
    }
  }, [user])

  async function onAccept(inv: PrivateInvitationItem) {
    const id = inv.invitacion_usuario_id
    if (id == null) return
    try {
      setSubmittingId(id)
      await acceptPrivateInvitation(id)
      setItems((prev) => prev.filter((x) => x.tipo !== 'invitacion' || x.invitacion_usuario_id !== id))
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
      setItems((prev) => prev.filter((x) => x.tipo !== 'invitacion' || x.invitacion_usuario_id !== id))
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

  if (loading) return <div className="text-sm text-slate-500">Cargando...</div>
  if (!items.length) return <EmptyState title="No hay actividad reciente" description="No tienes invitaciones o notificaciones en los últimos 14 días." />

  return (
    <div className="space-y-3">
      {items.map((item) => {
        if (item.tipo === 'notificacion') {
          // NOTIFICACIÓN
          const notif = item as NotificationActionItem
          const title = notif.evento?.titulo ?? 'Evento sin título'
          const fecha = notif.fechaHora ? new Date(notif.fechaHora).toLocaleString() : 'Sin fecha'
          const mensaje = notif.mensaje ?? '—'

          return (
            <div
              key={`notif-${notif.notificacion_accion_id ?? Math.random()}`}
              className="card p-4 rounded-lg border border-slate-200 bg-slate-50 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Fecha: {fecha}</p>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-slate-500">
                    {mensaje} 
                  </p>
                </div>
              </div>
            </div>
          )
        }

        else if (item.tipo === 'invitacion') {
          // INVITACIÓN
          const inv = item as PrivateInvitationItem
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
        }
      })}
    </div>
  )
}