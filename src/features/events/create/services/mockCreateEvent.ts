import { mockOk, mockFail } from '../../../../api/mock'

export type EventStatus = 'programado' | 'en_proceso' | 'finalizado' | 'cancelled'
export type EventPrivacy = 'public' | 'private'

export type EventItem = {
  id: string
  name: string
  startDate: string // ISO datetime
  endDate: string // ISO datetime
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
  address?: string
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
      startDate: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString(),
      endDate: new Date(now + 1000 * 60 * 60 * 24 * 7 + 2 * 60 * 60 * 1000).toISOString(),
      capacity: 100,
      description: 'A friendly community meetup for developers.',
      ownerId: '1',
      privacy: 'public',
      status: 'programado',
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
      startDate: new Date(now - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      endDate: new Date(now + 1000 * 60 * 60 * 1).toISOString(), // ends in 1 hour
      capacity: 40,
      description: 'Hands-on sprint to ideate and prototype.',
      ownerId: '1',
      privacy: 'public',
      status: 'en_proceso',
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
      startDate: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
      endDate: new Date(now - 1000 * 60 * 60 * 24 * 2 + 2 * 60 * 60 * 1000).toISOString(),
      capacity: 10,
      description: 'Invite-only planning for Q4.',
      ownerId: '1',
      privacy: 'private',
      status: 'finalizado',
      locationCity: 'Lima',
      guestsCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600&auto=format&fit=crop',
      category: 'Business',
      lat: -12.0464,
      lng: -77.0428,
    },
    {
      id: '4',
      name: 'Marketing Workshop',
      startDate: new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
      endDate: new Date(now + 1000 * 60 * 60 * 24 * 3 + 2 * 60 * 60 * 1000).toISOString(),
      capacity: 50,
      description: 'Learn modern marketing strategies and digital tools.',
      ownerId: '1',
      privacy: 'public',
      status: 'cancelled',
      locationCity: 'Lima',
      guestsCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1600&auto=format&fit=crop',
      category: 'Marketing',
      lat: -12.0464,
      lng: -77.0428,
    },
    {
      id: '5',
      name: 'Networking Event',
      startDate: new Date(now + 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days from now
      endDate: new Date(now + 1000 * 60 * 60 * 24 * 10 + 2 * 60 * 60 * 1000).toISOString(),
      capacity: 80,
      description: 'Connect with professionals in your industry.',
      ownerId: '1',
      privacy: 'public',
      status: 'programado',
      locationCity: 'Lima',
      guestsCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600&auto=format&fit=crop',
      category: 'Networking',
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

  const start = new Date(input.startDate)
  // force end = start + 24h
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  if (!(start > new Date())) return mockFail('Start date must be in the future') // TA008
  if (!(end > start)) return mockFail('End date must be after start date')

  if (!isInLima(input.locationCity)) return mockFail('Location must be within Lima') // TA009

  if (input.capacity > 100) return mockFail('Capacity cannot exceed 100 people') // TA011

  const perUserCount = db.events.filter((e) => e.ownerId === input.ownerId).length
  if (perUserCount >= MAX_EVENTS_PER_USER) return mockFail('You reached your event limit') // TA010

  const created: EventItem = {
    id: String(db.events.length + 1),
    name: input.name,
    startDate: input.startDate,
    endDate: end.toISOString(),
    capacity: input.capacity,
    description: input.description,
    ownerId: input.ownerId,
    privacy: input.privacy ?? 'public',
    status: 'programado',
    locationCity: input.locationCity,
    guestsCount: 0,
    imageUrl: input.imageUrl,
    category: input.category,
    lat: input.lat,
    lng: input.lng,
    address: input.address,
  }
  db.events.push(created)
  return mockOk({ event: created }) // TA012
}

export async function mockListManagedEvents(ownerId: string) {
  seedOnce()
  autoUpdateEventStatuses()
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 2 // 2 days ago
  const events = db.events.filter((e) => e.ownerId === ownerId && new Date(e.startDate).getTime() > cutoff)
  return mockOk({ events }) // TA013, TA014
}

export async function mockListPublicEvents() {
  seedOnce()
  autoUpdateEventStatuses()
  const now = Date.now()
  const events = db.events.filter((e) => {
    // Include public events
    if (e.privacy !== 'public') return false
    
    // Include future events
    if (new Date(e.startDate).getTime() > now) return true
    
    // Include cancelled events until their original date
    if (e.status === 'cancelled' && new Date(e.startDate).getTime() > now) return true
    
    return false
  })
  return mockOk({ events }) // TA059, TA060
}

export async function mockGetEventById(id: string) {
  seedOnce()
  autoUpdateEventStatuses()
  const found = db.events.find((e) => e.id === id)
  if (!found) return mockFail('Event not found')
  return mockOk({ event: found }) // TA018
}

// Attendance (public & private) ---------------------------------------------
export async function mockConfirmAttendance(eventId: string, userId: string) {
  const ev = db.events.find((e) => e.id === eventId)
  if (!ev) return mockFail('Event not found')
  if (new Date(ev.startDate) <= new Date()) return mockFail('Event already started') // TA039

  const already = db.attendance.some((a) => a.eventId === eventId && a.userId === userId)
  if (already) return mockFail('Already confirmed') // TA067 / TA035

  const currentCount = db.attendance.filter((a) => a.eventId === eventId).length
  if (currentCount >= ev.capacity) return mockFail('Event is full') // TA036 / TA068

  db.attendance.push({ eventId, userId, createdAt: new Date().toISOString() })
  return mockOk({ ok: true }) // TA041 / TA071
}

export async function mockListAttendedEvents(userId: string) {
  autoUpdateEventStatuses()
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 2
  const eventIds = db.attendance.filter((a) => a.userId === userId).map((a) => a.eventId)
  const events = db.events.filter((e) => eventIds.includes(e.id) && new Date(e.startDate).getTime() > cutoff)
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
  if (new Date(ev.startDate) <= new Date()) return mockFail('Event already started') // TA039

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

export async function mockUpdateEventStatus(eventId: string, newStatus: EventStatus, byUserId: string) {
  const ev = db.events.find((e) => e.id === eventId)
  if (!ev) return mockFail('Event not found')
  if (ev.ownerId !== byUserId) return mockFail('Only the organizer can change event status')
  
  // Validate status transitions
  const validTransitions: Record<EventStatus, EventStatus[]> = {
    'programado': ['en_proceso', 'cancelled'],
    'en_proceso': ['finalizado', 'cancelled'],
    'finalizado': [], // No transitions from finalizado
    'cancelled': [] // No transitions from cancelled
  }
  
  if (!validTransitions[ev.status].includes(newStatus)) {
    return mockFail(`Cannot change status from ${ev.status} to ${newStatus}`)
  }
  
  ev.status = newStatus
  return mockOk({ event: ev })
}

// Automatically update event statuses based on current time
function autoUpdateEventStatuses() {
  const now = Date.now()
  for (const ev of db.events) {
    if (ev.status === 'cancelled' || ev.status === 'finalizado') continue
    const start = new Date(ev.startDate).getTime()
    const end = new Date(ev.endDate).getTime()
    if (ev.status === 'programado' && now >= start) {
      ev.status = 'en_proceso'
      continue
    }
    if (ev.status === 'en_proceso' && now >= end) {
      ev.status = 'finalizado'
    }
  }
}
