import { useEffect, useState } from 'react'
import EmptyState from '../../../../components/EmptyState.tsx'
import { Button } from '../../../../components/Button.tsx'
import { useNavigate } from 'react-router-dom'
import { listAttendedEvents } from '../../services/eventsService.ts'
import { useAuthStore } from '../../../../store/authStore'

export default function AttendedEventsPage() {
  const user = useAuthStore((s) => s.user)
  const [events, setEvents] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!user?.id) return
    listAttendedEvents(user.id)
      .then((r) => setEvents(r.eventos || []))
      .catch(() => setEvents([]))
  }, [user?.id])

  if (!events.length) {
    return <EmptyState title="No attended events" description="Confirm attendance on public events to see them here." />
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((e) => (
        <div key={e.id} className="card p-4">
          <h3 className="font-semibold"><i className="bi bi-check2-circle me-2" />{e.name}</h3>
          <p className="text-sm text-slate-400 mt-1">{new Date(e.dateStart).toLocaleString()}</p>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => navigate(`/events/${e.id}`)}>
              <i className="bi bi-info-circle me-2" />View details
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
