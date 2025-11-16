import { useEffect, useState } from 'react'
import { Button } from '../../../../components/Button.tsx'
import { toast } from 'sonner'
import { listPublicEvents } from '../../services/eventsService'
import { useNavigate } from 'react-router-dom'
import { confirmPublicAttendance } from '../../details/service/EventDetailService'
import { useAuthStore } from '../../../../store/authStore'

export default function PublicEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    listPublicEvents().then((r) => setEvents(r.eventos as any))
  }, [])

  if (!events.length) return <p className="text-slate-400">No public events yet.</p>

  const handleConfirm = async (eventId: number | string) => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in')
        return
      }
      await confirmPublicAttendance(Number(eventId), Number(user.id))
      toast.success('Attendance confirmed')
      // Remove from public list locally
      setEvents((prev) => prev.filter((e) => String(e.id) !== String(eventId)))
      // Navigate to attended page
      navigate('/events/attended')
    } catch (err: any) {
      toast.error(err.message || 'Failed to confirm attendance')
    }
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((e) => (
        <div key={e.id} className="card overflow-hidden">
          {e.imageUrl && <img src={e.imageUrl} alt={e.name} className="w-full h-40 object-cover" />}
          <div className="p-4">
            <h3 className="font-semibold">{e.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{new Date(e.dateStart).toLocaleString()}</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => handleConfirm(e.id)}>
                <i className="bi bi-check2-circle me-2" />Confirm attendance
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/events/${e.id}`)}>
                <i className="bi bi-info-circle me-2" />Details
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}