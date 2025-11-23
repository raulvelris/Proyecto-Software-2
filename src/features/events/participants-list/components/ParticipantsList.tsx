import { ParticipanteItem } from '../service/ParticipantsListService'

interface ParticipantsListProps {
  organizer: ParticipanteItem | null
  coorganizers: ParticipanteItem[]
  attendees: ParticipanteItem[]
  canManageEvent: boolean
  onDeleteParticipant?: (participant: ParticipanteItem) => void
}

export function ParticipantsList({
  organizer,
  coorganizers,
  attendees,
  canManageEvent,
  onDeleteParticipant,
}: ParticipantsListProps) {
  return (
    <div className="card p-5 mt-5">
      <h2 className="font-semibold mb-2">Participantes</h2>
      <ul className="text-sm divide-y divide-white/5">
        {organizer && (
          <li className="py-2 flex items-center gap-2">
            <i className="bi bi-person-badge" />
            <span className="font-medium">{organizer.nombre} {organizer.apellido}</span>
            <span className="text-slate-400">– {organizer.correo}</span>
            <span className="ms-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
              Organizador
            </span>
          </li>
        )}

        {coorganizers.length > 0 && coorganizers.map((c) => (
          <li key={c.participante_id} className="py-2 flex items-center gap-2">
            <i className="bi bi-person-badge-fill" />
            <span className="font-medium">{c.nombre} {c.apellido}</span>
            <span className="text-slate-400">– {c.correo}</span>
            <span className="ms-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200">
              Coorganizador
            </span>
          </li>
        ))}

        {attendees.length ? (
          attendees.map((a) => (
            <li key={a.participante_id} className="py-2 flex items-center gap-2">
              <i className="bi bi-person-circle" />
              <span>{a.nombre} {a.apellido}</span>
              <span className="text-slate-400">– {a.correo}</span>
              {canManageEvent && (
                <button
                  className="ms-auto text-sm text-red-600 hover:underline"
                  onClick={() => onDeleteParticipant?.(a)}
                >
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
  )
}
