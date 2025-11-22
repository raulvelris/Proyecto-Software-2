import { useEffect, useState } from 'react'
import EmptyState from '../../../../components/EmptyState.tsx'
import { Button } from '../../../../components/Button.tsx'
import { useNavigate } from 'react-router-dom'
import { listAttendedEvents } from '../../services/eventsService.ts'

export default function AttendedEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    listAttendedEvents().then((r) => setEvents(r.eventos as any))
  }, [])

  if (!events.length) {
    return <EmptyState title="No attended events" description="Confirm attendance on public events to see them here." />
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((e) => (
        <div key={e.id} className="card overflow-hidden">
          {e.imageUrl && <img src={e.imageUrl} alt={e.name} className="w-full h-40 object-cover" />}
          <div className="p-4">
            <h3 className="font-semibold">{e.name}</h3>
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
