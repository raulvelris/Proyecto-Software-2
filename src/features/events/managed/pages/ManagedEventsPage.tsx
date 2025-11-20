import React, { useEffect, useState } from 'react'
import EmptyState from '../../../../components/EmptyState'
import { Link, useNavigate } from 'react-router-dom'
import { listManagedEvents } from '../../services/eventsService'
import { Button } from '../../../../components/Button.tsx'

type ManagedEvent = { id: string | number; name: string; dateStart: string; imageUrl?: string; capacity?: number; managedAs?: 'Organizador' | 'Coorganizador' | null; isOrganizer?: boolean }

export default function ManagedEventsPage() {
  const [events, setEvents] = useState<ManagedEvent[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    listManagedEvents().then((r) => setEvents(r.eventos as any))
  }, [])

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
        <div key={e.id} className="card overflow-hidden">
          {e.imageUrl && (
            <img src={e.imageUrl} alt={e.name} className="w-full h-40 object-cover" />
          )}
          <div className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold truncate">{e.name}</h3>
            {e.managedAs && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${e.isOrganizer ? 'bg-green-600/30 text-green-300 border border-green-600/50' : 'bg-amber-600/30 text-amber-300 border border-amber-600/50'}`}>
                {e.isOrganizer ? 'Creado' : 'Coorganizado'}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {new Date(e.dateStart).toLocaleDateString()} — {new Date(e.dateStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="mt-4">
            <Button variant="secondary" onClick={() => navigate(`/events/${e.id}`)}>
              <i className="bi bi-info-circle me-2" />View details
            </Button>
          </div>
          </div>
        </div>
      ))}
    </div>
  )
}
