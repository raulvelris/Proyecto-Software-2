import { useEffect, useState } from 'react'
import InviteUsersModal from '../../invite/pages/InviteUsersModal'
import { useParams } from 'react-router-dom'
import { mockGetEventById, mockListAttendees, mockCancelEvent, type EventItem } from '../../create/services/mockCreateEvent'
import { Button } from '../../../../components/Button'
import { useAuthStore } from '../../../../store/authStore'
import { toast } from 'sonner'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [attendees, setAttendees] = useState<{ id: string; name: string; email: string }[]>([])
  const user = useAuthStore((s) => s.user)
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    if (!id) return
    mockGetEventById(id).then((r) => setEvent(r.data.event)).catch(() => setEvent(null))
    mockListAttendees(id).then((r) => setAttendees(r.data.attendees))
  }, [id])

  if (!event) return <p className="text-slate-400">Loading…</p>

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="card overflow-hidden">
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.name} className="w-full h-64 object-cover" />
          )}
          <div className="p-5">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            {event.category && (
              <span className="inline-flex items-center gap-2 mt-2 text-xs text-blue-300 bg-blue-500/10 px-2 py-1 rounded-full">
                <i className="bi bi-tag" /> {event.category}
              </span>
            )}
          </div>
        </div>

        <div className="card p-5 mt-5">
          <h2 className="font-semibold mb-2">About this event</h2>
          <p className="text-slate-300">{event.description || 'No description provided.'}</p>
        </div>

        <div className="card p-5 mt-5">
          <h2 className="font-semibold mb-2">Attendees ({attendees.length})</h2>
          {attendees.length ? (
            <ul className="text-sm divide-y divide-white/5">
              {attendees.map((a) => (
                <li key={a.id} className="py-2 flex items-center gap-2">
                  <i className="bi bi-person-circle" />
                  <span>{a.name}</span>
                  <span className="text-slate-400">– {a.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm">No attendees yet.</p>
          )}
        </div>
      </div>

      <aside className="space-y-5">
        <div className="card p-5">
          <ul className="text-sm space-y-3">
            <li className="flex items-center gap-2"><i className="bi bi-calendar-event" /> {new Date(event.date).toLocaleDateString()}</li>
            <li className="flex items-center gap-2"><i className="bi bi-clock" /> {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
            <li className="flex items-center gap-2"><i className="bi bi-geo" /> {event.locationCity}</li>
            <li className="flex items-center gap-2"><i className="bi bi-shield-check" /> {event.privacy === 'public' ? 'Public Event' : 'Private Event'}</li>
            <li className="flex items-center gap-2"><i className="bi bi-people" /> Capacity: {event.capacity}</li>
          </ul>
        </div>

        <div className="card overflow-hidden">
          <div className="h-56 w-full bg-white/5 flex items-center justify-center">
            {event.lat && event.lng ? (
              <img alt="Map" className="w-full h-56 object-cover"
                   src={`https://maps.googleapis.com/maps/api/staticmap?center=${event.lat},${event.lng}&zoom=12&size=600x300&markers=color:red|${event.lat},${event.lng}`}
              />
            ) : (
              <div className="p-4 text-sm text-slate-400">Map preview unavailable</div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold">Organizer Tools</h3>
          <div className="mt-3 grid grid-cols-1 gap-2">
            <Button variant="secondary" onClick={() => setShowInviteModal(true)}><i className="bi bi-envelope me-2" />Invite Attendees</Button>
            <Button variant="secondary" onClick={() => toast.info('Edit coming soon') }><i className="bi bi-pencil-square me-2" />Edit Event</Button>
            <Button variant="danger" onClick={async () => {
              if (!user) return toast.error('Login required')
              try {
                await mockCancelEvent(event.id, user.id)
                toast.success('Event cancelled')
                const r = await mockGetEventById(event.id)
                setEvent(r.data.event)
              } catch (e: any) {
                toast.error(e?.message ?? 'Could not cancel event')
              }
            }}><i className="bi bi-x-circle me-2" />Cancel Event</Button>
          </div>
        </div>
      </aside>
      <InviteUsersModal open={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </div>
  )
}
