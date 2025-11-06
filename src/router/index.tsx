import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'

// Auth feature pages
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import ActivateAccountPage from '../features/auth/pages/ActivateAccountPage'
import ActivationSuccessPage from '../features/auth/pages/ActivationSuccessPage'
import ProfilePage from '../features/auth/pages/ProfilePage'

// Events feature pages
import CreateEventPage from '../features/events/create/pages/CreateEventPage'
import ManagedEventsPage from '../features/events/managed/pages/ManagedEventsPage'
import EventDetailPage from '../features/events/details/pages/EventDetailPage'
import PublicEventsPage from '../features/events/public/pages/PublicEventsPage'
import InvitationsInboxPage from '../features/events/invitations/pages/InvitationsInboxPage'
import AttendedEventsPage from '../features/events/attended/pages/AttendedEventsPage'

import { PrivateRoute } from './privateRoute'

export const router = createBrowserRouter([
  // Rutas públicas (sin autenticación)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/activate/success', element: <ActivationSuccessPage /> },
      { path: '/activate/:token', element: <ActivateAccountPage /> },
    ],
  },
  // Rutas protegidas (requieren autenticación)
  {
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/events/public" replace /> },
      { path: '/events/public', element: <PublicEventsPage /> },
      { path: '/events/:id', element: <EventDetailPage /> },
      { path: '/events/create', element: <CreateEventPage /> },
      { path: '/events/managed', element: <ManagedEventsPage /> },
      { path: '/invitations', element: <InvitationsInboxPage /> },
      { path: '/attended', element: <AttendedEventsPage /> },
      { path: '/profile', element: <ProfilePage /> },
      // Redirección de rutas no encontradas a la página principal
      { path: '*', element: <Navigate to="/events/public" replace /> },
    ],
  },
  // Redirigir la ruta raíz al login
  { path: '/', element: <Navigate to="/login" replace /> },
])

export default router
