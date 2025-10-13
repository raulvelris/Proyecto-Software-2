import React, { useState } from 'react'
import EventForm, { type EventFormValues } from '../components/EventForm'
import { createEvent } from '../../services/eventsService'
import { toast } from 'sonner'
import { useAuthStore } from '../../../../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function CreateEventPage() {
  const [submitting, setSubmitting] = useState(false)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  async function handleSubmit(values: EventFormValues) {
    if (!user) return
    setSubmitting(true)
    try {
      await createEvent({
        name: values.name,
        date: new Date(values.date).toISOString(),
        capacity: values.capacity,
        description: values.description,
        ownerId: user.id,
        privacy: values.privacy,
        locationAddress: values.locationAddress,
        imageUrl: values.imageUrl,
        lat: values.lat,
        lng: values.lng,
      })
      toast.success('Event created')
      navigate('/events/managed')
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
