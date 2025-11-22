export type EventStatus = 'draft' | 'published' | 'cancelled'
export type EventPrivacy = 'public' | 'private'

export type Event = {
  name: string
  dateStart?: string // start datetime ISO
  dateEnd?: string // end datetime ISO
  capacity: number
  description?: string
  privacy: EventPrivacy
  locationCity: string
  guestsCount?: number
  imageUrl?: string
  category?: string
}
