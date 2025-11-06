// En src/store/authStore.ts
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
  login: (user: User, token: string) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  // Función para cargar el estado inicial desde localStorage
  const loadInitialState = () => {
    const token = localStorage.getItem('auth_token')
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    
    return {
      user,
      token,
      isAuthenticated: !!token
    }
  }

  return {
    ...loadInitialState(), // Carga el estado inicial al crear el store
    
    login: (user, token) => {
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user)) // Guarda el usuario
      set({ user, token, isAuthenticated: true })
    },
    
    logout: () => {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      localStorage.setItem('auth_logout', Date.now().toString())
      set({ user: null, token: null, isAuthenticated: false })
    },
    
    initialize: () => {
      // Esta función se puede llamar al cargar la aplicación
      const state = loadInitialState()
      set(state)
    }
  }
})

// Sincronización entre pestañas
if (typeof window !== 'undefined') {
  // Escucha cambios en localStorage
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth_logout') {
      // Cierra sesión en esta pestaña
      useAuthStore.getState().logout()
    } else if (e.key === 'auth_token' || e.key === 'user') {
      // Si el token o el usuario cambian, actualiza el estado
      useAuthStore.getState().initialize()
    }
  })
}