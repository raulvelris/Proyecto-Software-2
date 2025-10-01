import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '../../../../components/Input'
import { Button } from '../../../../components/Button'

export const eventSchema = z.object({
  name: z.string().min(3, 'Name too short'),
  date: z.string().refine((v) => !!v && new Date(v) > new Date(), 'Date must be in the future'),
  capacity: z.coerce.number().int().positive('Capacity must be > 0'),
  description: z.string().optional(),
  privacy: z.enum(['public', 'private']).default('public'),
  locationCity: z.string().min(2, 'City is required'),
})

export type EventFormValues = z.infer<typeof eventSchema>

export default function EventForm({ onSubmit, submitting }: { onSubmit: (values: EventFormValues) => void; submitting?: boolean }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({ resolver: zodResolver(eventSchema), defaultValues: { name: '', date: '', capacity: 10, description: '', privacy: 'public', locationCity: 'Lima' } })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Event name" placeholder="Launch Party" error={errors.name?.message} {...register('name')} />
      <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
      <Input label="Capacity" type="number" min={1} error={errors.capacity?.message} {...register('capacity', { valueAsNumber: true })} />
      <div>
        <label className="label">Description</label>
        <textarea className="input min-h-[100px]" placeholder="Optional" {...register('description')} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Privacy</label>
          <select className="input" {...register('privacy')}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <Input label="City" placeholder="Lima" error={errors.locationCity?.message} {...register('locationCity')} />
      </div>
      <Button disabled={submitting} className="w-full">{submitting ? 'Creating…' : 'Create event'}</Button>
    </form>
  )
}
