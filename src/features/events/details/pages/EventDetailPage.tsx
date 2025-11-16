import { useEffect, useState } from 'react'
import InviteUsersModal from '../../invite/pages/InviteUsersModal'
import { useParams } from 'react-router-dom'
import { Button } from '../../../../components/Button.tsx'
import { useAuthStore } from '../../../../store/authStore.ts'
import { toast } from 'sonner'
import { getEventoDetalle, getParticipantesByEvento, type ParticipanteItem } from '../../../../features/events/details/service/EventDetailService.ts'
import { ResourcesSection } from '../../resources/components/ResourcesSection.tsx'
import { getCoordenadas } from '../../../../features/events/details/service/CoordinatesService.ts'
import type { Event as EventItem } from '../../../../types/EventTipo.ts'
import InteractiveMap from '../components/InteractiveMap'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [organizer, setOrganizer] = useState<ParticipanteItem | null>(null)
  const [attendees, setAttendees] = useState<ParticipanteItem[]>([])
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
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
          name: ev.titulo ?? 'Untitled Event',
          dateStart: ev.fechaInicio ? new Date(ev.fechaInicio).toISOString() : undefined,
          dateEnd: ev.fechaFin ? new Date(ev.fechaFin).toISOString() : undefined,
          capacity: typeof ev.aforo === 'number' ? ev.aforo : 0,
          description: ev.descripcion ?? undefined,
          privacy: (ev.privacidad === 1 ? 'public' : 'private'),
          locationCity: ev.ubicacion?.direccion ?? '',
          guestsCount: typeof ev.attendeesCount === 'number' ? ev.attendeesCount : 0,
          imageUrl: ev.imagen ?? undefined,
        }
        setEvent(mapped)
      })
      .catch(() => setEvent(null))
    // Obtener participantes (organizador + asistentes)
    getParticipantesByEvento(Number(id))
      .then((r) => {
        const list = (r.participantes || []) as ParticipanteItem[]
        const roleOf = (p: ParticipanteItem) => (p.rol || '').toLowerCase()
        const org = list.find((p) => roleOf(p) === 'organizador') || null
        // asistentes reales: excluir organizadores y coorganizadores
        const others = list.filter((p) => !['organizador', 'coorganizador'].includes(roleOf(p)))
        setOrganizer(org) 
        setAttendees(others)
      })
      .catch(() => {
        setOrganizer(null)
        setAttendees([])
      })
    // Obtener coordenadas
    getCoordenadas(Number(id))
      .then((r) => {
        if (r.success && r.coordenadas) {
          const { latitud, longitud } = r.coordenadas
          if (typeof latitud === 'number' && typeof longitud === 'number') {
            setCoordinates({ lat: latitud, lng: longitud })
          }
        }
      })
      .catch((err) => {
        console.error('Error al obtener coordenadas:', err)
        setCoordinates(null)
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
          <>
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
            
            {/* Sección de Recursos */}
            <ResourcesSection eventoId={id || ''} isOrganizer={isOrganizer} />
          </>
        )}
      </div>

      <aside className="space-y-5">
        <div className="card p-5">
          <ul className="text-sm space-y-3">
            {event.dateStart && (
              <li className="flex items-center gap-2">
                <i className="bi bi-calendar-event" />
                <span>
                  <span className="text-slate-400">Fecha inicio:</span> {new Date(event.dateStart).toLocaleDateString()} — {new Date(event.dateStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            )}
            {event.dateEnd && (
              <li className="flex items-center gap-2">
                <i className="bi bi-calendar2-check" />
                <span>
                  <span className="text-slate-400">Fecha fin:</span> {new Date(event.dateEnd).toLocaleDateString()} — {new Date(event.dateEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            )}
            <li className="flex items-center gap-2"><i className="bi bi-geo" /> {event.locationCity}</li>
            <li className="flex items-center gap-2"><i className="bi bi-shield-check" /> {event.privacy === 'public' ? 'Public Event' : 'Private Event'}</li>
            <li className="flex items-center gap-2"><i className="bi bi-people" /> Asistentes: {typeof event.guestsCount === 'number' ? event.guestsCount : attendees.length} / {event.capacity}</li>
          </ul>
        </div>

        <div className="card overflow-hidden p-4">
          {coordinates ? (
            <InteractiveMap
              coordinates={coordinates}
              eventName={event.name}
              locationCity={event.locationCity}
              apiKey={apiKey}
            />
          ) : (
            <div className="p-4 text-sm text-slate-400">Map preview unavailable</div>
          )}
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
