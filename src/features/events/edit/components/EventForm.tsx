import React from 'react'
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '../../../../components/Input'
import { Button } from '../../../../components/Button'
import LocationPicker from '../../../../components/LocationPicker'
import { toast } from 'sonner'

export const eventFormSchema = z.object({
  name: z.string().min(3, 'Name too short'),
  date: z
    .string()
    .refine((v) => !!v && new Date(v) > new Date(), 'Date must be in the future'),
  capacity: z.coerce.number().int().positive('Capacity must be > 0').max(100, 'Capacity must be ≤ 100'),
  description: z.string().optional(),
  privacy: z.enum(['public', 'private']).default('public'),
  locationAddress: z.string().min(3, 'Pick a location').refine((v) => /lima/i.test(v), 'Location must be within Lima'),
  imageUrl: z.string().url({ message: 'Image is required' }),
  lat: z.number(),
  lng: z.number(),
})

export type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormProps {
  initialValues?: Partial<EventFormValues>
  onSubmit: (values: EventFormValues) => void
  submitting?: boolean
  isEdit?: boolean
}

export default function EventForm({ 
  initialValues = {}, 
  onSubmit, 
  submitting = false,
  isEdit = false 
}: EventFormProps) {
  const [preview, setPreview] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [pickerOpen, setPickerOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema) as unknown as Resolver<EventFormValues>,
    defaultValues: {
      name: '',
      date: '',
      capacity: 10,
      description: '',
      privacy: 'public',
      locationAddress: '',
      lat: undefined as unknown as number,
      lng: undefined as unknown as number,
      imageUrl: '',
      ...initialValues
    },
  })

  const imageUrl = watch('imageUrl')
  
  React.useEffect(() => {
    if (initialValues.imageUrl) {
      setPreview(initialValues.imageUrl)
    }
  }, [initialValues.imageUrl])

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

  const handleLocationSelect = (addr: string, lat: number, lng: number) => {
    setValue('locationAddress', addr, { shouldValidate: true })
    setValue('lat', lat, { shouldValidate: true })
    setValue('lng', lng, { shouldValidate: true })
    setPickerOpen(false)
  }

  const onSubmitForm: SubmitHandler<EventFormValues> = (data) => {
    try {
      onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Error al enviar el formulario')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <Input 
        label="Event name" 
        placeholder="Launch Party" 
        error={errors.name?.message} 
        {...register('name')} 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Start</label>
          <input
            type="datetime-local"
            className={`input ${errors.date ? 'input-error' : ''}`}
            {...register('date')}
          />
          {errors.date?.message && <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>}
        </div>
        <Input 
          label="Capacity" 
          type="number" 
          min={1} 
          max={100} 
          error={errors.capacity?.message} 
          {...register('capacity', { valueAsNumber: true })} 
        />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea 
          className="input min-h-[140px]" 
          placeholder="Optional" 
          {...register('description')} 
        />
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
        {errors.imageUrl?.message && <p className="text-red-400 text-sm mt-1">{errors.imageUrl.message}</p>}
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
      </div>

      <div>
        <label className="label">Location</label>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input 
              className="input" 
              readOnly 
              value={getValues('locationAddress') || ''} 
              placeholder="Pick on map (Lima only)" 
            />
            {errors.locationAddress?.message && (
              <p className="text-red-400 text-sm mt-1">{errors.locationAddress.message}</p>
            )}
          </div>
          <Button type="button" onClick={() => setPickerOpen(true)}>Pick location</Button>
        </div>
      </div>

      {/* Location Picker Modal */}
      {pickerOpen && (
        <LocationPicker
          onCancel={() => setPickerOpen(false)}
          onSelect={handleLocationSelect}
        />
      )}

      <Button 
        type="submit" 
        disabled={submitting} 
        className="w-full"
      >
        {submitting ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
      </Button>
    </form>
  )
}
