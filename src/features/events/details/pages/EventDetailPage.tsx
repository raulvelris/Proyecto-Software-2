import { useEffect, useState } from 'react'
import InviteUsersModal from '../../invite/pages/InviteUsersModal'
import { useParams } from 'react-router-dom'
import { Button } from '../../../../components/Button.tsx'
import { useAuthStore } from '../../../../store/authStore.ts'
import { toast } from 'sonner'
import { getEventoDetalle, getParticipantesByEvento, type ParticipanteItem } from '../../../../features/events/details/service/EventDetailService.ts'

// wtf que es esto??
// Nota: tuve que pegarlo aqui pq habia muchos mocks y ya los quité PQ SE TRABAJA CON BACKEND
export type EventStatus = 'draft' | 'published' | 'cancelled'
export type EventPrivacy = 'public' | 'private'

export type EventItem = {
  id: string
  name: string
  date: string // start datetime ISO
  capacity: number
  description?: string
  ownerId: string
  privacy: EventPrivacy
  status: EventStatus
  locationCity: string
  guestsCount?: number
  imageUrl?: string
  category?: string
  lat?: number
  lng?: number
}
// FIN DEL COMENTARIO, MOVERLO A OTRO LADO, AQUI NO

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [organizer, setOrganizer] = useState<ParticipanteItem | null>(null)
  const [attendees, setAttendees] = useState<ParticipanteItem[]>([])
  const user = useAuthStore((s) => s.user)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const apiKey = "AIzaSyA8vLnFywOEzRuXRFdfID5EW4dMIjaXoO8"
  const isOrganizer = Boolean(organizer && user?.id && Number(organizer.usuario_id) === Number(user.id))

  useEffect(() => {
    if (!id) return
    // Obtener detalle real desde el backend y mapear al shape de EventItem
    getEventoDetalle(Number(id))
      .then((r) => {
        const ev = r.evento as any
        const mapped: EventItem = {
          id: ev.evento_id,
          name: ev.titulo ?? 'Untitled Event',
          date: ev.fechaInicio ? new Date(ev.fechaInicio).toISOString() : new Date().toISOString(),
          capacity: typeof ev.aforo === 'number' ? ev.aforo : 0,
          description: ev.descripcion ?? undefined,
          ownerId: '0',
          privacy: (ev.privacidad === 1 ? 'public' : 'private'),
          status: 'published',
          locationCity: ev.ubicacion?.direccion ?? '',
          guestsCount: 0,
          imageUrl: ev.imagen ?? undefined,
          category: undefined,
          lat: typeof ev.ubicacion?.latitud === 'number' ? ev.ubicacion.latitud : undefined,
          lng: typeof ev.ubicacion?.longitud === 'number' ? ev.ubicacion.longitud : undefined,
        }
        setEvent(mapped)
      })
      .catch(() => setEvent(null))
    // Obtener participantes (organizador + asistentes)
    getParticipantesByEvento(Number(id))
      .then((r) => {
        const list = (r.participantes || []) as ParticipanteItem[]
        const org = list.find((p) => (p.rol || '').toLowerCase() === 'organizador') || null
        const others = list.filter((p) => (p.rol || '').toLowerCase() !== 'organizador')
        setOrganizer(org)
        setAttendees(others)
      })
      .catch(() => {
        setOrganizer(null)
        setAttendees([])
      })
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

        {isOrganizer && (
          <div className="card p-5 mt-5">
            <h2 className="font-semibold mb-2">Asistentes</h2>
            <ul className="text-sm divide-y divide-white/5">
              {organizer && (
                <li className="py-2 flex items-center gap-2">
                  <i className="bi bi-person-badge" />
                  <span className="font-medium">{organizer.nombre} {organizer.apellido}</span>
                  <span className="text-slate-400">– {organizer.correo}</span>
                  <span className="ms-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">Organizador</span>
                </li>
              )}
              {attendees.length ? (
                attendees.map((a) => (
                  <li key={a.participante_id} className="py-2 flex items-center gap-2">
                    <i className="bi bi-person-circle" />
                    <span>{a.nombre} {a.apellido}</span>
                    <span className="text-slate-400">– {a.correo}</span>
                  </li>
                ))
              ) : (
                <li className="py-2 text-slate-400 text-sm">No hay asistentes aún.</li>
              )}
            </ul>
          </div>
        )}
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
                   src={`https://maps.googleapis.com/maps/api/staticmap?center=${event.lat},${event.lng}&zoom=12&size=600x300&markers=color:red|${event.lat},${event.lng}${apiKey ? `&key=${apiKey}` : ''}`}
              />
            ) : (
              <div className="p-4 text-sm text-slate-400">Map preview unavailable</div>
            )}
          </div>
        </div>

        {isOrganizer && (
          <div className="card p-5">
            <h3 className="font-semibold">Organizer Tools</h3>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <Button variant="secondary" onClick={() => setShowInviteModal(true)}><i className="bi bi-envelope me-2" />Invite Attendees</Button>
              <Button variant="secondary" onClick={() => toast.info('Edit coming soon') }><i className="bi bi-pencil-square me-2" />Edit Event</Button>
              <Button variant="danger" onClick={() => toast.info('Cancel functionality will be implemented later') }><i className="bi bi-x-circle me-2" />Cancel Event</Button>
            </div>
          </div>
        )}
      </aside>
      {isOrganizer && (
        <InviteUsersModal open={showInviteModal} onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  )
}
