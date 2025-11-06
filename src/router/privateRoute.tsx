// En src/router/PrivateRoute.tsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useEffect } from 'react'

export function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialize } = useAuthStore()
  const location = useLocation()

  // Inicializar el estado de autenticación al montar
  useEffect(() => {
    initialize()
  }, [initialize])

  if (!isAuthenticated) {
    // Redirigir al login, guardando la ubicación actual
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}