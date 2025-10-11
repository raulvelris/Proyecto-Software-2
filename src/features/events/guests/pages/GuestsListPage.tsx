import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import EmptyState from '../../../../components/EmptyState'
import { obtenerInvitados } from '../../invite/services/InviteService'
import type { UsuarioTipo } from '../../../../types/UsuarioTipo'

export default function GuestsListPage() {
  const { id: eventIdParam } = useParams<{ id?: string }>()
  const [guests, setGuests] = useState<UsuarioTipo[] | null>(null)
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const eventId = eventIdParam ?? 0 // si no existe param, usar 0 como fallback
        const invited = await obtenerInvitados(eventId)

        if (!invited || !invited.length) {
          setGuests([])
          return
        }

        // API devuelve participantes confirmados: adaptamos al tipo UsuarioTipo mínimo
        const users = invited.map((i: any) => ({
          usuario_id: Number(i.usuario_id),
          clave: '',
          correo: i.correo || `user+${i.usuario_id}@example.com`,
          isActive: true,
          Cliente: { nombre: i.nombre, apellido: i.apellido },
        }))

        setGuests(users as any)
      } catch (e: any) {
        console.error('Error loading guests', e)
        setError(e?.message || 'Error cargando asistentes')
        setGuests([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [eventIdParam])

  if (loading) return <div className="p-4">Cargando asistentes...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>
  if (!guests || !guests.length) {
    return <EmptyState title="No hay asistentes" description="Aún no hay invitados para este evento." />
  }

  return (
    <div className="card p-4">
      <ul className="divide-y divide-white/5">
        {guests.map((g) => (
          <li key={g.usuario_id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{g.Cliente?.nombre ?? `Usuario #${g.usuario_id}`}</div>
              <div className="text-sm text-slate-400">{g.correo}</div>
            </div>
            <div className="text-sm text-slate-400">Confirmado</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
