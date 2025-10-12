import React, { useEffect, useState } from 'react'
import { mockListPublicEvents, type EventItem } from '../../create/services/mockCreateEvent'
import { Button } from '../../../../components/Button'
import { toast } from 'sonner'
import { confirmPublicAttendance } from '../../../../features/events/details/service/EventDetailService'
import { useAuthStore } from '../../../../store/authStore'

export default function PublicEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    mockListPublicEvents().then((r) => setEvents(r.data.events))
  }, [])

  async function confirmAttendance(e: EventItem) {
    try {
      if (!user) {
        toast.error('Login required')
        return
      }
      await confirmPublicAttendance(Number(e.id), Number(user.id))
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
        <div key={e.id} className="card overflow-hidden">
          {e.imageUrl && <img src={e.imageUrl} alt={e.name} className="w-full h-40 object-cover" />}
          <div className="p-4">
            <h3 className="font-semibold"><i className="bi bi-broadcast me-2" />{e.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{new Date(e.date).toLocaleString()}</p>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => confirmAttendance(e)}><i className="bi bi-check2-circle me-2" />Confirm attendance</Button>
              <Button variant="secondary" onClick={() => window.location.assign(`/events/${e.id}`)}><i className="bi bi-info-circle me-2" />Details</Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
