import { useEffect, useState } from 'react'
import { Button } from '../../../../components/Button.tsx'
import { toast } from 'sonner'
import { listPublicEvents, listAttendedEvents } from '../../services/eventsService'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../../store/authStore'
import { confirmPublicAttendance } from '../../details/service/EventDetailService'

export default function PublicEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        // Pasar usuarioId para excluir eventos donde es organizador
        const res = await listPublicEvents(user?.id)
        if (!res.success) {
          toast.error('Error loading events')
          return
        }
        let publicEvents = res.eventos || []
        // Filtrar eventos donde ya confirmó asistencia
        // No se deberia filtrar aqui, se deberia filtrar en el backend
        if (user?.id) {
          const att = await listAttendedEvents(user.id)
          const attendedIds = new Set((att.eventos || []).map((e: any) => String(e.id)))
          publicEvents = publicEvents.filter((e: any) => !attendedIds.has(String(e.id)))
        }
        if (!cancelled) setEvents(publicEvents)
      } catch {
        toast.error('Error connecting to backend')
      }
    }
    load()
    return () => { cancelled = true }
  }, [user?.id])

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