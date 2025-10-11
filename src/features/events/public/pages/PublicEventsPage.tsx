import React, { useEffect, useState } from 'react'
import { API_CONFIG, handleApiResponse } from '../../../../config/api'
import { Button } from '../../../../components/Button'
import { toast } from 'sonner'

type EventItem = {
  id: number | string
  name: string
  date: string
  attendeesCount: number
  location: string
  imageUrl?: string
}

export default function PublicEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/eventos`)
        const data = await handleApiResponse<{ success: boolean; eventos: any[] }>(res)

        const mapped: EventItem[] = (data.eventos || []).map((ev: any) => ({
          id: ev.id ?? ev.evento_id,
          name: ev.name ?? ev.titulo ?? 'Untitled',
          date: ev.date ?? ev.fechaHora ?? new Date().toISOString(),
          attendeesCount: ev.attendeesCount ?? 0,
          location: ev.location ?? 'Sin ubicación',
          imageUrl: ev.imageUrl ?? undefined,
        }))

        setEvents(mapped)
      } catch (err) {
        console.error('Error cargando eventos:', err)
        toast.error('No se pudieron cargar los eventos')
      }
    }

    fetchEvents()
  }, [])

  if (!events.length) {
    return <p className="text-slate-400 px-6 py-8">No public events yet.</p>
  }

  return (
    <div className="px-6 py-6">
      <h1 className="text-2xl font-semibold mb-6">Public Events</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(e => (
          <div key={e.id} className="card overflow-hidden">
            {e.imageUrl && (
              <img
                src={e.imageUrl}
                alt={e.name}
                className="w-full h-40 object-cover"
                onError={(ev) => ((ev.currentTarget as HTMLImageElement).style.display = 'none')}
              />
            )}

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{e.name}</h3>

              <p className="text-sm text-slate-400">
                {new Date(e.date).toLocaleString()}
              </p>

              <p className="text-sm text-slate-300 mt-1">
                👥 {e.attendeesCount} asistentes
              </p>

              <p className="text-sm text-slate-300">
                📍 {e.location}
              </p>

              <div className="mt-4 flex gap-2">
                <Button onClick={() => toast.success(`Attendance confirmed for ${e.name}`)}>
                  Confirm attendance
                </Button>
                <Button variant="secondary" onClick={() => window.location.assign(`/events/${e.id}`)}>
                  Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

