import { create } from 'zustand'

export type User = {
  id: string
  name: string
  email: string
}

type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token?: string) => void
  logout: () => void
}

const STORAGE_KEY = 'auth_state'

function loadInitial(): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { user: null, token: null, isAuthenticated: false }
    const parsed = JSON.parse(raw)
    if (parsed && parsed.user && parsed.token) {
      return { user: parsed.user, token: parsed.token, isAuthenticated: true }
    }
  } catch {}
  return { user: null, token: null, isAuthenticated: false }
}

export const useAuthStore = create<AuthState>((set) => ({
  ...loadInitial(),
  login: (user, token) => {
    const next = { user, token: token ?? 'mock-token', isAuthenticated: true }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: next.user, token: next.token }))
    set(next)
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
