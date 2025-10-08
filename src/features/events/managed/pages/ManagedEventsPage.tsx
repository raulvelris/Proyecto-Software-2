import { useEffect, useState } from 'react'
import { useAuthStore } from '../../../../store/authStore'
import { mockListManagedEvents, mockUpdateEventStatus, type EventItem, type EventStatus } from '../../create/services/mockCreateEvent'
import EmptyState from '../../../../components/EmptyState'
import EventStatusBadge from '../../../../components/EventStatus'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

export default function ManagedEventsPage() {
  const user = useAuthStore((s) => s.user)
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    if (!user) return
    mockListManagedEvents(user.id).then((r) => setEvents(r.data.events))
  }, [user])

  async function updateEventStatus(eventId: string, newStatus: EventStatus) {
    if (!user) return
    try {
      await mockUpdateEventStatus(eventId, newStatus, user.id)
      toast.success('Event status updated')
      // Refresh events
      const result = await mockListManagedEvents(user.id)
      setEvents(result.data.events)
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update event status')
    }
  }

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
        <Link key={e.id} to={`/events/${e.id}`} className={`card hover:bg-white/5 transition overflow-hidden ${e.status === 'cancelled' ? 'opacity-75 border-red-200' : ''}`}>
          {e.imageUrl && (
            <div className="relative">
              <img src={e.imageUrl} alt={e.name} className="w-full h-36 object-cover" />
              {e.status === 'cancelled' && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                    CANCELADO
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${e.status === 'cancelled' ? 'line-through text-slate-500' : ''}`}>
                <i className="bi bi-layout-text-window-reverse me-2" />{e.name}
              </h3>
              <EventStatusBadge status={e.status} />
            </div>
            <p className="text-sm text-slate-400 mt-1">{new Date(e.startDate).toLocaleString()} — {new Date(e.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-sm text-slate-400">Capacity: {e.capacity}</p>
            
            {e.status === 'cancelled' && (
              <p className="text-sm text-red-500 mt-1 font-medium">
                Este evento ha sido cancelado
              </p>
            )}
            
            {/* No manual start: auto transitions now handle status */}
            <div className="mt-3 space-y-2">
              {e.status === 'programado' && (
                <button 
                  onClick={(ev) => {
                    ev.preventDefault()
                    updateEventStatus(e.id, 'cancelled')
                  }}
                  className="px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded-md transition-colors"
                >
                  Cancelar
                </button>
              )}
              {e.status === 'en_proceso' && (
                <p className="text-xs text-slate-400">El evento está en curso y finalizará automáticamente al llegar la hora de fin.</p>
              )}
              {e.status === 'cancelled' && (
                <p className="text-xs text-red-500">
                  No se pueden realizar más cambios
                </p>
              )}
            </div>
            
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
