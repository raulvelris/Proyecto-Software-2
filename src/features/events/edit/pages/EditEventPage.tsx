import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '../../../../store/authStore'
import EventForm, { type EventFormValues } from '../../shared/components/EventForm'
import { updateEvent } from '../../services/eventsService'
import { getEventoDetalle } from '../../details/service/EventDetailService'
import { getCoordenadas } from '../../details/service/CoordinatesService'

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<any>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return
      try {
        const response = await getEventoDetalle(Number(id))
        if (response.evento) {
          setEvent(response.evento)
        }
        // Cargar coordenadas por separado para precargar el formulario
        try {
          const coordsRes = await getCoordenadas(Number(id))
          if (coordsRes?.success && coordsRes.coordenadas) {
            const { latitud, longitud } = coordsRes.coordenadas
            if (typeof latitud === 'number' && typeof longitud === 'number') {
              setCoords({ lat: latitud, lng: longitud })
            }
          }
        } catch (err) {
          console.error('Error fetching coordinates:', err)
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        toast.error('Error al cargar el evento')
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  async function handleSubmit(values: EventFormValues) {
    if (!user || !id) {
      toast.error('Usuario no autenticado o ID de evento inválido')
      return
    }
    
    setSubmitting(true)
    try {
      const result = await updateEvent(Number(id), {
        name: values.name,
        date: new Date(values.date).toISOString(),
        capacity: values.capacity,
        description: values.description,
        privacy: values.privacy || 'public',
        locationAddress: values.locationAddress,
        imageUrl: values.imageUrl,
        lat: values.lat,
        lng: values.lng
      })
      
      if (result && result.success) {
        toast.success('Evento actualizado correctamente')
        navigate(`/events/${id}`)
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Error al actualizar el evento')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-10">Cargando evento...</div>
  }

  if (!event) {
    return <div className="text-center py-10">Evento no encontrado</div>
  }

  // Map the event data to match the form values
  const initialValues: EventFormValues = {
    name: event.titulo || '',
    description: event.descripcion || '',
    date: event.fechaInicio ? new Date(event.fechaInicio).toISOString().slice(0, 16) : '',
    capacity: event.aforo || 0,
    privacy: event.privacidad === 1 ? 'public' : 'private',
    locationAddress: event.ubicacion?.direccion || '',
    imageUrl: event.imagen || '',
    lat: (coords?.lat ?? 0),
    lng: (coords?.lng ?? 0),
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold">Editar Evento</h1>
      <p className="text-sm text-slate-400 mb-6">Actualiza los detalles de tu evento.</p>
      <EventForm 
        initialValues={initialValues}
        onSubmit={handleSubmit} 
        submitting={submitting} 
        isEdit={true} 
      />
    </div>
  )
}
