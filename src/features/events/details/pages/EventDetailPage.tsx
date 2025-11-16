import { useEffect, useState } from 'react'
import InviteUsersModal from '../../invite/pages/InviteUsersModal'
import { useParams } from 'react-router-dom'
import { Button } from '../../../../components/Button.tsx'
import Modal from '../../../../components/Modal'
import { useAuthStore } from '../../../../store/authStore.ts'
import { toast } from 'sonner'
import { getEventoDetalle, getParticipantesByEvento, desvincularme, eliminarInvitado, type ParticipanteItem } from '../../../../features/events/details/service/EventDetailService.ts'
import type { Event as EventItem } from '../../../../types/EventTipo.ts'

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [organizer, setOrganizer] = useState<ParticipanteItem | null>(null)
  const [attendees, setAttendees] = useState<ParticipanteItem[]>([])
  const user = useAuthStore((s) => s.user)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showUnlinkModal, setShowUnlinkModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [toDeleteUser, setToDeleteUser] = useState<ParticipanteItem | null>(null)
  const [isCoorganizer, setIsCoorganizer] = useState(false)
  const apiKey = "AIzaSyA8vLnFywOEzRuXRFdfID5EW4dMIjaXoO8"
  const isOrganizer = Boolean(organizer && user?.id && Number(organizer.usuario_id) === Number(user.id))
  const isParticipant = Boolean(attendees.find((p) => Number(p.usuario_id) === Number(user?.id)))

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
          dateEnd: ev.fechaFin ? new Date(ev.fechaFin).toISOString() : undefined,
          capacity: typeof ev.aforo === 'number' ? ev.aforo : 0,
          description: ev.descripcion ?? undefined,
          ownerId: '0',
          privacy: (ev.privacidad === 1 ? 'public' : 'private'),
          status: 'published',
          locationCity: ev.ubicacion?.direccion ?? '',
          guestsCount: typeof ev.attendeesCount === 'number' ? ev.attendeesCount : 0,
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
        const roleOf = (p: ParticipanteItem) => (p.rol || '').toLowerCase()
        const org = list.find((p) => roleOf(p) === 'organizador') || null
        // asistentes reales: excluir organizadores y coorganizadores
        const others = list.filter((p) => !['organizador', 'coorganizador'].includes(roleOf(p)))
        setOrganizer(org)
        setAttendees(others)

        // determinar si el usuario actual es organizador o coorganizador
        if (user?.id) {
          const self = list.find((p) => Number(p.usuario_id) === Number(user.id));
          const isCoorg = !!self && (self.rol || '').toLowerCase() === 'coorganizador';
          const isOrg = !!org && Number(org.usuario_id) === Number(user.id);
          setIsCoorganizer(isCoorg);
          // isOrganizer ya depende de organizer variable + user
        }
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
                    { (isOrganizer || isCoorganizer) && (
                      <button className="ms-auto text-sm text-red-600 hover:underline" onClick={() => { setToDeleteUser(a); setShowDeleteModal(true); }}>
                        Eliminar
                      </button>
                    )}
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
            <li className="flex items-center gap-2">
              <i className="bi bi-calendar-event" />
              <span>
                <span className="text-slate-400">Fecha inicio:</span> {new Date(event.date).toLocaleDateString()} — {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </li>
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
        {!isOrganizer && isParticipant && (
          <div className="card p-5 mt-5">
            <h3 className="font-semibold">Participation</h3>
            <div className="mt-3">
              <Button variant="danger" onClick={() => setShowUnlinkModal(true)}><i className="bi bi-x-circle me-2" />Desvincularme</Button>
            </div>
          </div>
        )}
      </aside>
      {isOrganizer && (
        <InviteUsersModal open={showInviteModal} onClose={() => setShowInviteModal(false)} />
      )}
      {/* Confirmación desvinculación */}
      <Modal open={showUnlinkModal} onClose={() => setShowUnlinkModal(false)} title="¿Estás seguro?">
        <p className="text-sm text-slate-400">¿Estás seguro de desvincularte de este evento? Esta acción no se puede deshacer.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowUnlinkModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={async () => {
            try {
              if (!id || !user?.id) return;
              await desvincularme(Number(id), Number(user.id));
              toast.success('Te has desvinculado del evento correctamente');
              // refrescar participantes y detalle
              await getEventoDetalle(Number(id)).then((r) => setEvent((r.evento as any) ? {
                id: (r.evento as any).evento_id,
                name: (r.evento as any).titulo ?? 'Untitled Event',
                date: (r.evento as any).fechaInicio ? new Date((r.evento as any).fechaInicio).toISOString() : new Date().toISOString(),
                dateEnd: (r.evento as any).fechaFin ? new Date((r.evento as any).fechaFin).toISOString() : undefined,
                capacity: typeof (r.evento as any).aforo === 'number' ? (r.evento as any).aforo : 0,
                description: (r.evento as any).descripcion ?? undefined,
                ownerId: '0',
                privacy: ((r.evento as any).privacidad === 1 ? 'public' : 'private'),
                status: 'published',
                locationCity: (r.evento as any).ubicacion?.direccion ?? '',
                guestsCount: typeof (r.evento as any).attendeesCount === 'number' ? (r.evento as any).attendeesCount : 0,
                imageUrl: (r.evento as any).imagen ?? undefined,
                category: undefined,
                lat: typeof (r.evento as any).ubicacion?.latitud === 'number' ? (r.evento as any).ubicacion.latitud : undefined,
                lng: typeof (r.evento as any).ubicacion?.longitud === 'number' ? (r.evento as any).ubicacion.longitud : undefined,
              } : null)).catch(() => {});
              await getParticipantesByEvento(Number(id)).then((r) => setAttendees(((r.participantes || []) as ParticipanteItem[]).filter((p) => !['organizador', 'coorganizador'].includes((p.rol || '').toLowerCase())))).catch(() => {});
            } catch (err: any) {
              console.error(err);
              toast.error(err?.message || 'Error al desvincularte');
            } finally {
              setShowUnlinkModal(false);
            }
          }}>Desvincularme</Button>
        </div>
      </Modal>
      {/* Confirmación Eliminar Invitado */}
      <Modal open={showDeleteModal} onClose={() => { setShowDeleteModal(false); setToDeleteUser(null); }} title="¿Estás seguro de eliminar a este participante?">
        <p className="text-sm text-slate-400">¿Estás seguro de eliminar a este participante? Esta acción no se puede deshacer.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => { setShowDeleteModal(false); setToDeleteUser(null); }}>Cancelar</Button>
          <Button variant="danger" onClick={async () => {
            try {
              if (!id || !toDeleteUser) return;
              await eliminarInvitado(Number(id), Number(toDeleteUser.usuario_id));
              toast.success('Participante eliminado correctamente');
              // refrescar participantes
              await getParticipantesByEvento(Number(id)).then((r) => setAttendees(((r.participantes || []) as ParticipanteItem[]).filter((p) => !['organizador', 'coorganizador'].includes((p.rol || '').toLowerCase())))).catch(() => {});
            } catch (err: any) {
              console.error(err);
              toast.error(err?.message || 'Error al eliminar al participante');
            } finally {
              setShowDeleteModal(false);
              setToDeleteUser(null);
            }
          }}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}
