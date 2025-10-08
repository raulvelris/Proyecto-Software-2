import { useState } from 'react'
import EventForm, { type EventFormValues } from '../components/EventForm'
import { mockCreateEvent } from '../services/mockCreateEvent'
import { toast } from 'sonner'
import { useAuthStore } from '../../../../store/authStore'

export default function CreateEventPage() {
  const [submitting, setSubmitting] = useState(false)
  const user = useAuthStore((s) => s.user)

  async function handleSubmit(values: EventFormValues) {
    if (!user) return
    setSubmitting(true)
    try {
      const start = new Date(values.startDate)
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
      await mockCreateEvent({
        name: values.name,
        startDate: values.startDate,
        endDate: end.toISOString(),
        capacity: values.capacity,
        description: values.description,
        ownerId: user.id,
        privacy: values.privacy,
        locationCity: values.locationCity,
        imageUrl: values.image,
        address: values.address,
        lat: values.lat,
        lng: values.lng,
      })
      toast.success('Event created')
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to create event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold">Create Event</h1>
      <p className="text-sm text-slate-400 mb-6">Set up details for your new event.</p>
      <EventForm onSubmit={handleSubmit} submitting={submitting} />
    </div>
  )
}
