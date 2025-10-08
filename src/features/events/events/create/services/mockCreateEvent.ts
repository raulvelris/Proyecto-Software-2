import { mockOk, mockFail } from '../../../../api/mock'

export type EventStatus = 'draft' | 'published' | 'cancelled'
export type EventPrivacy = 'public' | 'private'

export type EventItem = {
  id: string
  name: string
  date: string // start datetime ISO
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

type InvitationStatus = 'pending' | 'accepted' | 'rejected'

const db: {
  events: EventItem[]
  invitations: { id: string; eventId: string; toUserEmail: string; status: InvitationStatus; createdAt: string }[]
  attendance: { eventId: string; userId: string; createdAt: string }[]
  users: { id: string; email: string; name: string }[]
} = {
  events: [],
  invitations: [],
  attendance: [],
  users: [
    { id: '1', email: 'demo@example.com', name: 'Demo User' },
    { id: '2', email: 'jane@example.com', name: 'Jane Doe' },
    { id: '3', email: 'john@example.com', name: 'John Doe' },
  ],
}

const MAX_EVENTS_PER_USER = 5

function isInLima(city: string) {
  return city.trim().toLowerCase() === 'lima'
}

function seedOnce() {
  if (db.events.length) return
  const now = Date.now()
  db.events.push(
    {
      id: '1',
      name: 'Tech Meetup 2026',
      date: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString(),
      capacity: 120,
      description: 'A friendly community meetup for developers.',
      ownerId: '1',
      privacy: 'public',
      status: 'published',
      locationCity: 'Lima',
      guestsCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?q=80&w=1600&auto=format&fit=crop',
      category: 'Technology',
      lat: -12.0464,
      lng: -77.0428,
    },
    {
      id: '2',
      name: 'Design Sprint',
      date: new Date(now + 1000 * 60 * 60 * 24 * 14).toISOString(),
      capacity: 40,
      description: 'Hands-on sprint to ideate and prototype.',
      ownerId: '1',
      privacy: 'public',
      status: 'published',
      locationCity: 'Lima',
      guestsCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1529336953121-ad3260b77ee3?q=80&w=1600&auto=format&fit=crop',
      category: 'Design',
      lat: -12.0464,
      lng: -77.0428,
    },
    {
      id: '3',
      name: 'Private Strategy Session',
      date: new Date(now + 1000 * 60 * 60 * 24 * 21).toISOString(),
      capacity: 10,
      description: 'Invite-only planning for Q4.',
      ownerId: '1',
      privacy: 'private',
      status: 'published',
      locationCity: 'Lima',
      guestsCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600&auto=format&fit=crop',
      category: 'Business',
      lat: -12.0464,
      lng: -77.0428,
    }
  )
  // Seed some attendance and invitations
  db.attendance.push(
    { eventId: '1', userId: '2', createdAt: new Date(now - 1000 * 60 * 60).toISOString() },
    { eventId: '1', userId: '3', createdAt: new Date(now - 1000 * 60 * 30).toISOString() },
  )
  db.invitations.push(
    { id: '1', eventId: '3', toUserEmail: 'jane@example.com', status: 'pending', createdAt: new Date().toISOString() },
    { id: '2', eventId: '3', toUserEmail: 'john@example.com', status: 'accepted', createdAt: new Date().toISOString() },
  )
}

seedOnce()

export async function mockCreateEvent(input: Omit<EventItem, 'id' | 'status' | 'privacy' | 'locationCity'> & { privacy?: EventPrivacy; locationCity: string }) {
  const nameExists = db.events.some((e) => e.name.toLowerCase() === input.name.toLowerCase())
  if (nameExists) return mockFail('Event name must be unique') // TA007

  const start = new Date(input.date)
  if (!(start > new Date())) return mockFail('Start date must be in the future') // TA008

  if (!isInLima(input.locationCity)) return mockFail('Location must be within Lima') // TA009

  const perUserCount = db.events.filter((e) => e.ownerId === input.ownerId).length
  if (perUserCount >= MAX_EVENTS_PER_USER) return mockFail('You reached your event limit') // TA010

  const created: EventItem = {
    id: String(db.events.length + 1),
    name: input.name,
    date: input.date,
    capacity: input.capacity,
    description: input.description,
    ownerId: input.ownerId,
    privacy: input.privacy ?? 'public',
    status: 'published',
    locationCity: input.locationCity,
    guestsCount: 0,
    imageUrl: input.imageUrl,
    category: input.category,
    lat: input.lat,
    lng: input.lng,
  }
  db.events.push(created)
  return mockOk({ event: created }) // TA012
}

export async function mockListManagedEvents(ownerId: string) {
  seedOnce()
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 2 // 2 days ago
  const events = db.events.filter((e) => e.ownerId === ownerId && new Date(e.date).getTime() > cutoff)
  return mockOk({ events }) // TA013, TA014
}

export async function mockListPublicEvents() {
  seedOnce()
  const events = db.events.filter((e) => e.privacy === 'public' && new Date(e.date).getTime() > Date.now())
  return mockOk({ events }) // TA059, TA060
}

export async function mockGetEventById(id: string) {
  seedOnce()
  const found = db.events.find((e) => e.id === id)
  if (!found) return mockFail('Event not found')
  return mockOk({ event: found }) // TA018
}

// Attendance (public & private) ---------------------------------------------
export async function mockConfirmAttendance(eventId: string, userId: string) {
  const ev = db.events.find((e) => e.id === eventId)
  if (!ev) return mockFail('Event not found')
  if (new Date(ev.date) <= new Date()) return mockFail('Event already started') // TA039

  const already = db.attendance.some((a) => a.eventId === eventId && a.userId === userId)
  if (already) return mockFail('Already confirmed') // TA067 / TA035

  const currentCount = db.attendance.filter((a) => a.eventId === eventId).length
  if (currentCount >= ev.capacity) return mockFail('Event is full') // TA036 / TA068

  db.attendance.push({ eventId, userId, createdAt: new Date().toISOString() })
  return mockOk({ ok: true }) // TA041 / TA071
}

export async function mockListAttendedEvents(userId: string) {
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 2
  const eventIds = db.attendance.filter((a) => a.userId === userId).map((a) => a.eventId)
  const events = db.events.filter((e) => eventIds.includes(e.id) && new Date(e.date).getTime() > cutoff)
  return mockOk({ events }) // TA043, TA044
}

// Invitations ----------------------------------------------------------------
export async function mockInviteUser(eventId: string, toEmail: string) {
  const ev = db.events.find((e) => e.id === eventId)
  if (!ev) return mockFail('Event not found')
  if (ev.privacy !== 'private') return mockFail('Invitations only for private events')

  const user = db.users.find((u) => u.email.toLowerCase() === toEmail.toLowerCase())
  if (!user) return mockFail('User not found') // TA027

  const dup = db.invitations.find((i) => i.eventId === eventId && i.toUserEmail.toLowerCase() === toEmail.toLowerCase() && (i.status === 'pending' || i.status === 'accepted'))
  if (dup) return mockFail('User already invited') // TA028

  const invitedCount = db.invitations.filter((i) => i.eventId === eventId && i.status !== 'rejected').length
  const attendingCount = db.attendance.filter((a) => a.eventId === eventId).length
  if (invitedCount + attendingCount >= ev.capacity) return mockFail('Invitation limit reached for this event') // TA029

  db.invitations.push({ id: String(db.invitations.length + 1), eventId, toUserEmail: toEmail, status: 'pending', createdAt: new Date().toISOString() })
  return mockOk({ ok: true }) // TA031
}

export async function mockListInvitations(toUserEmail: string) {
  const items = db.invitations.filter((i) => i.toUserEmail.toLowerCase() === toUserEmail.toLowerCase())
  const detailed = items.map((i) => ({ ...i, event: db.events.find((e) => e.id === i.eventId)! }))
  return mockOk({ invitations: detailed }) // TA080, TA081
}

export async function mockRespondInvitation(invitationId: string, accept: boolean, userId: string) {
  const inv = db.invitations.find((i) => i.id === invitationId)
  if (!inv) return mockFail('Invitation not found')
  if (inv.status !== 'pending') return mockFail('Already responded') // TA035

  const ev = db.events.find((e) => e.id === inv.eventId)
  if (!ev) return mockFail('Event not found')
  if (new Date(ev.date) <= new Date()) return mockFail('Event already started') // TA039

  if (accept) {
    const currentCount = db.attendance.filter((a) => a.eventId === ev.id).length
    if (currentCount >= ev.capacity) return mockFail('Event is full') // TA036
    db.attendance.push({ eventId: ev.id, userId, createdAt: new Date().toISOString() })
    inv.status = 'accepted'
  } else {
    inv.status = 'rejected'
  }
  return mockOk({ ok: true }) // TA042
}

export function __resetEventsForTests() {
  db.events.length = 0
  seedOnce()
}

// Extra helpers for UI -------------------------------------------------------
export async function mockListAttendees(eventId: string) {
  const userIds = db.attendance.filter((a) => a.eventId === eventId).map((a) => a.userId)
  const attendees = db.users.filter((u) => userIds.includes(u.id))
  return mockOk({ attendees })
}

export async function mockCancelEvent(eventId: string, byUserId: string) {
  const ev = db.events.find((e) => e.id === eventId)
  if (!ev) return mockFail('Event not found')
  if (ev.ownerId !== byUserId) return mockFail('Only the organizer can cancel the event')
  ev.status = 'cancelled'
  return mockOk({ event: ev })
}
