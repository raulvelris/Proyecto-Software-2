import React from 'react'
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '../../../../components/Input'
import { Button } from '../../../../components/Button'

export const eventSchema = z.object({
  name: z.string().min(3, 'Name too short'),
  date: z
    .string()
    .refine((v) => !!v && new Date(v) > new Date(), 'Date must be in the future'),
  capacity: z.coerce.number().int().positive('Capacity must be > 0'),
  description: z.string().optional(),
  privacy: z.enum(['public', 'private']).default('public'),
  locationCity: z.string().min(2, 'City is required'),
  locationExact: z.string().optional(),
  imageUrl: z.string().url().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
})

export type EventFormValues = z.infer<typeof eventSchema>

export default function EventForm({
  onSubmit,
  submitting,
}: {
  onSubmit: SubmitHandler<EventFormValues>
  submitting?: boolean
}) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as unknown as Resolver<EventFormValues>,
    defaultValues: {
      name: '',
      date: '',
      capacity: 10,
      description: '',
      privacy: 'public',
      locationCity: 'Lima',
      locationExact: '',
    },
  })

  function handlePickImage() {
    fileInputRef.current?.click()
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
    setValue('imageUrl', url, { shouldValidate: false })
  }

  function openGoogleMapsSearch() {
    const q = getValues('locationExact') || getValues('locationCity') || ''
    if (q) window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}`, '_blank')
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      setValue('lat', pos.coords.latitude, { shouldValidate: false })
      setValue('lng', pos.coords.longitude, { shouldValidate: false })
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Event name" placeholder="Launch Party" error={errors.name?.message} {...register('name')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Start</label>
          <input
            type="datetime-local"
            className="input"
            {...register('date')}
          />
          {errors.date?.message && <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>}
        </div>
        <Input label="Capacity" type="number" min={1} error={errors.capacity?.message} {...register('capacity', { valueAsNumber: true })} />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea className="input min-h-[140px]" placeholder="Optional" {...register('description')} />
      </div>

      <div>
        <label className="label">Event Image</label>
        <div
          className="border border-dashed border-slate-600 rounded-md p-6 flex items-center justify-center text-slate-400 h-40 bg-slate-900/30"
          onClick={handlePickImage}
          role="button"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-32 rounded" />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">+</span>
              <span>Click to add image</span>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <Button type="button" onClick={handlePickImage}>Select Image</Button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>
        <p className="text-xs text-slate-500 mt-2">Recommended: Full width, 160px height. Max 5MB. JPG, PNG, or GIF.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Privacy</label>
          <select className="input" {...register('privacy')}>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        <div>
          <label className="label">City</label>
          <select className="input" {...register('locationCity')}>
            <option value="Lima">Lima</option>
            <option value="Miraflores">Miraflores</option>
            <option value="Surco">Surco</option>
          </select>
          {errors.locationCity?.message && (
            <p className="text-red-400 text-sm mt-1">{errors.locationCity.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="label">Exact Location</label>
        <input className="input" placeholder="Enter exact address (e.g., Av. Larco 123, Miraflores, Lima)" {...register('locationExact')} />
        <div className="mt-3 flex gap-3">
          <Button type="button" variant="secondary" onClick={openGoogleMapsSearch}>Search on Google Maps</Button>
          <Button type="button" variant="secondary" onClick={useCurrentLocation}>Use Current Location</Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Enter the exact address manually or use Google Maps to search and get precise coordinates.</p>
      </div>

      <Button disabled={submitting} className="w-full">{submitting ? 'Creating…' : 'Create event'}</Button>
    </form>
  )
}
