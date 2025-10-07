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

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: (user, token) => set({ user, token: token ?? 'mock-token', isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}))
