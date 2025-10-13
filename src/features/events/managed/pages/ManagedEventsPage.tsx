import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../../../store/authStore'
import EmptyState from '../../../../components/EmptyState'
import { Link } from 'react-router-dom'
import { listManagedEvents } from '../../services/eventsService'

type ManagedEvent = { id: string | number; name: string; dateStart: string; imageUrl?: string; capacity?: number }

export default function ManagedEventsPage() {
  const user = useAuthStore((s) => s.user)
  const [events, setEvents] = useState<ManagedEvent[]>([])

  useEffect(() => {
    if (!user) return
    listManagedEvents(user.id).then((r) => setEvents(r.eventos as any))
  }, [user])

  if (!events.length) {
    return (
      <EmptyState
        title="Aún no has creado eventos"
        description="Crea tu primer evento y empieza a invitar asistentes."
        action={<Link to="/events/create" className="btn-primary">Crear evento</Link>}
      />
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((e) => (
        <Link key={e.id} to={`/events/${e.id}`} className="card hover:bg-white/5 transition overflow-hidden">
          {e.imageUrl && (
            <img src={e.imageUrl} alt={e.name} className="w-full h-36 object-cover" />
          )}
          <div className="p-4">
          <h3 className="font-semibold"><i className="bi bi-layout-text-window-reverse me-2" />{e.name}</h3>
          <p className="text-sm text-slate-400 mt-1">{new Date(e.dateStart).toLocaleString()}</p>
          {typeof e.capacity !== 'undefined' && (
            <p className="text-sm text-slate-400">Capacity: {e.capacity}</p>
          )}
          <div className="mt-3 text-sm text-blue-400 flex items-center gap-1">
            <i className="bi bi-info-circle" />
            <span>Más información</span>
          </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
