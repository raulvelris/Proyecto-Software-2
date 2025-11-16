export type EventStatus = 'draft' | 'published' | 'cancelled'
export type EventPrivacy = 'public' | 'private'

export type Event = {
  id: string
  name: string
  date: string // start datetime ISO
  dateEnd?: string // end datetime ISO
  capacity: number
  description?: string
  ownerId: string
  privacy: EventPrivacy
  status: EventStatus
  locationCity: string
  guestsCount?: number
  imageUrl?: string
  category?: string
  lat?: number
  lng?: number
}
