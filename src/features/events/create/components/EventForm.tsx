import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '../../../../components/Input'
import { Button } from '../../../../components/Button'
import ImageUpload from '../../../../components/ImageUpload'
import LocationInput from '../../../../components/LocationInput'

export const eventSchema = z.object({
  name: z.string().min(3, 'Name too short'),
  startDate: z.string().refine((v) => !!v && new Date(v) > new Date(), 'Start must be in the future'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').max(100, 'Capacity cannot exceed 100 people'),
  description: z.string().optional(),
  privacy: z.enum(['public', 'private']),
  locationCity: z.string().min(2, 'City is required'),
  image: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export type EventFormValues = z.infer<typeof eventSchema>

export default function EventForm({ onSubmit, submitting }: { onSubmit: (values: EventFormValues) => void; submitting?: boolean }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormValues>({ 
    resolver: zodResolver(eventSchema), 
    defaultValues: { 
      name: '', 
      startDate: '',
      capacity: 10, 
      description: '', 
      privacy: 'public', 
      locationCity: 'Lima',
      image: '',
      address: '',
      lat: undefined,
      lng: undefined
    } 
  })

  const imageValue = watch('image')
  const addressValue = watch('address')
  const latValue = watch('lat')
  const lngValue = watch('lng')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Event name" placeholder="Launch Party" error={errors.name?.message} {...register('name')} />
      <Input label="Start" type="datetime-local" error={errors.startDate?.message} {...register('startDate')} />
      <Input label="Capacity" type="number" min={1} max={100} error={errors.capacity?.message} {...register('capacity', { valueAsNumber: true })} />
      <div>
        <label className="label">Description</label>
        <textarea className="input min-h-[100px]" placeholder="Optional" {...register('description')} />
      </div>
      <ImageUpload 
        value={imageValue}
        onChange={(value) => setValue('image', value)}
        error={errors.image?.message}
      />
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
      <LocationInput
        address={addressValue}
        lat={latValue}
        lng={lngValue}
        onLocationChange={(data) => {
          setValue('address', data.address)
          setValue('lat', data.lat)
          setValue('lng', data.lng)
        }}
        error={errors.address?.message}
      />
      <Button disabled={submitting} className="w-full">{submitting ? 'Creating…' : 'Create event'}</Button>
    </form>
  )
}
