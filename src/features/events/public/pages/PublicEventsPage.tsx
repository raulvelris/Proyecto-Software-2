import { useEffect, useState } from 'react'
import { mockListPublicEvents, mockConfirmAttendance, type EventItem } from '../../create/services/mockCreateEvent'
import { Button } from '../../../../components/Button'
import EventStatusBadge from '../../../../components/EventStatus'
import { toast } from 'sonner'

export default function PublicEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    mockListPublicEvents().then((r) => setEvents(r.data.events))
  }, [])

  async function confirmAttendance(e: EventItem) {
    try {
      await mockConfirmAttendance(e.id, '1')
      toast.success(`Attendance confirmed for ${e.name}`)
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not confirm attendance')
    }
  }

  if (!events.length) {
    return <p className="text-slate-400">No public events yet.</p>
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((e) => (
        <div key={e.id} className={`card overflow-hidden ${e.status === 'cancelled' ? 'opacity-75 border-red-200' : ''}`}>
          {e.imageUrl && (
            <div className="relative">
              <img src={e.imageUrl} alt={e.name} className="w-full h-40 object-cover" />
              {e.status === 'cancelled' && (
                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    EVENTO CANCELADO
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${e.status === 'cancelled' ? 'line-through text-slate-500' : ''}`}>
                <i className="bi bi-broadcast me-2" />{e.name}
              </h3>
              <EventStatusBadge status={e.status} />
            </div>
            <p className="text-sm text-slate-400 mt-1">{new Date(e.startDate).toLocaleString()} — {new Date(e.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            {e.status === 'cancelled' && (
              <p className="text-sm text-red-500 mt-1 font-medium">
                Este evento ha sido cancelado
              </p>
            )}
            <div className="mt-4 flex gap-2">
              {e.status !== 'cancelled' && (
                <Button onClick={() => confirmAttendance(e)}>
                  <i className="bi bi-check2-circle me-2" />Confirm attendance
                </Button>
              )}
              <Button variant="secondary" onClick={() => window.location.assign(`/events/${e.id}`)}>
                <i className="bi bi-info-circle me-2" />Details
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
