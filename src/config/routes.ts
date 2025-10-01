export const ROUTES = {
  login: '/login',
  register: '/register',
  activateSuccess: '/activate/success',
  activateExpired: '/activate/expired',
  events: {
    create: '/events/create',
    managed: '/events/managed',
    public: '/events/public',
    detail: (id: string | number) => `/events/${id}`,
  },
  invitations: '/invitations',
  guests: '/guests',
  attended: '/attended',
} as const
