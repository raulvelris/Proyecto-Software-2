import React, { useEffect, useState } from 'react'
import { useAuthStore } from '../../../../store/authStore'
import { mockListManagedEvents, type EventItem } from '../../create/services/mockCreateEvent'
import EmptyState from '../../../../components/EmptyState'
import { Link } from 'react-router-dom'

export default function ManagedEventsPage() {
  const user = useAuthStore((s) => s.user)
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    if (!user) return
    mockListManagedEvents(user.id).then((r) => setEvents(r.data.events))
  }, [user])

  if (!events.length) {
    return (
      <EmptyState
        title="You haven't created events yet"
        description="Create your first event and start inviting guests."
        action={<Link to="/events/create" className="btn-primary">Create event</Link>}
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
          <p className="text-sm text-slate-400 mt-1">{new Date(e.date).toLocaleString()}</p>
          <p className="text-sm text-slate-400">Capacity: {e.capacity}</p>
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
