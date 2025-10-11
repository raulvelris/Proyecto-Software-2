import { useEffect, useState } from 'react'
import { Button } from '../../../../components/Button'
import { toast } from 'sonner'
import { listPublicEvents } from '../../services/eventsService'  // <-- el nuevo servicio

export default function PublicEventsPage() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    listPublicEvents()
      .then((res) => {
        if (res.success) setEvents(res.eventos)
        else toast.error('Error loading events')
      })
      .catch(() => toast.error('Error connecting to backend'))
  }, [])

  if (!events.length) return <p className="text-slate-400">No public events yet.</p>

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((e) => (
        <div key={e.id} className="card overflow-hidden">
          {e.imageUrl && <img src={e.imageUrl} alt={e.name} className="w-full h-40 object-cover" />}
          <div className="p-4">
            <h3 className="font-semibold">{e.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{new Date(e.date).toLocaleString()}</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => toast('Attendance confirmed')}>
                <i className="bi bi-check2-circle me-2" />Confirm attendance
              </Button>
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

