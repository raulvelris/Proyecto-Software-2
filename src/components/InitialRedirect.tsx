import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function InitialRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    // Si está autenticado, redirigir a la pantalla principal
    return <Navigate to="/events/public" replace />
  }

  // Si no está autenticado, redirigir al login
  return <Navigate to="/login" replace />
}
