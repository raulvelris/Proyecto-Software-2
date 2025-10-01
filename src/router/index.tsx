import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'

// Auth feature pages
import LoginPage from '../features/auth/pages/LoginPage'
import RegisterPage from '../features/auth/pages/RegisterPage'
import ActivationSuccessPage from '../features/auth/pages/ActivationSuccessPage'
import ActivationExpiredPage from '../features/auth/pages/ActivationExpiredPage'
import ProfilePage from '../features/auth/pages/ProfilePage'

// Events feature pages
import CreateEventPage from '../features/events/create/pages/CreateEventPage'
import ManagedEventsPage from '../features/events/managed/pages/ManagedEventsPage'
import EventDetailPage from '../features/events/details/pages/EventDetailPage'
import PublicEventsPage from '../features/events/public/pages/PublicEventsPage'
import InvitationsInboxPage from '../features/events/invitations/pages/InvitationsInboxPage'
import GuestsListPage from '../features/events/guests/pages/GuestsListPage'
import AttendedEventsPage from '../features/events/attended/pages/AttendedEventsPage'

import { PrivateRoute } from './privateRoute'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="/events/public" replace /> },
      // Public pages
      { path: '/events/public', element: <PublicEventsPage /> },
      { path: '/events/:id', element: <EventDetailPage /> },

      // Private pages (guarded individually)
      { path: '/events/create', element: (
        <PrivateRoute>
          <CreateEventPage />
        </PrivateRoute>
      ) },
      { path: '/events/managed', element: (
        <PrivateRoute>
          <ManagedEventsPage />
        </PrivateRoute>
      ) },
      { path: '/invitations', element: (
        <PrivateRoute>
          <InvitationsInboxPage />
        </PrivateRoute>
      ) },
      { path: '/guests', element: (
        <PrivateRoute>
          <GuestsListPage />
        </PrivateRoute>
      ) },
      { path: '/attended', element: (
        <PrivateRoute>
          <AttendedEventsPage />
        </PrivateRoute>
      ) },
      { path: '/profile', element: (
        <PrivateRoute>
          <ProfilePage />
        </PrivateRoute>
      ) },
    ],
  },
  // Auth pages
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/activate/success', element: <ActivationSuccessPage /> },
      { path: '/activate/expired', element: <ActivationExpiredPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/events/public" replace /> },
])

export default router
