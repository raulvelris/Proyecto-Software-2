import React, { useEffect, useState } from 'react'
import EmptyState from '../../../../components/EmptyState'
import { mockListAttendedEvents, type EventItem } from '../../create/services/mockCreateEvent'
import { useAuthStore } from '../../../../store/authStore'

export default function AttendedEventsPage() {
  const user = useAuthStore((s) => s.user)
  const [events, setEvents] = useState<EventItem[]>([])

  useEffect(() => {
    if (!user) return
    mockListAttendedEvents(user.id).then((r) => setEvents(r.data.events))
  }, [user])

  if (!events.length) {
    return <EmptyState title="No attended events" description="Confirm attendance on public events to see them here." />
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((e) => (
        <div key={e.id} className="card p-4">
          <h3 className="font-semibold"><i className="bi bi-check2-circle me-2" />{e.name}</h3>
          <p className="text-sm text-slate-400 mt-1">{new Date(e.startDate).toLocaleString()} — {new Date(e.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      ))}
    </div>
  )
}
