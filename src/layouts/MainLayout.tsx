import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useAuthStore } from '../store/authStore'

export default function MainLayout() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:text-white hover:bg-white/5'}`

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 bg-[#0f1630]/60 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <i className="bi bi-calendar2-event text-xl text-blue-400" />
            <span className="text-white font-semibold">EventMaster</span>
            <span className="text-slate-400">/</span>
            <div className="flex gap-1">
              <NavLink to="/events/public" className={linkClass}><i className="bi bi-broadcast me-1" />Public</NavLink>
              <NavLink to="/events/managed" className={linkClass}><i className="bi bi-layout-text-window-reverse me-1" />Managed</NavLink>
              <NavLink to="/events/create" className={linkClass}><i className="bi bi-plus-circle me-1" />Create</NavLink>
              <NavLink to="/attended" className={linkClass}><i className="bi bi-check2-circle me-1" />Attended</NavLink>
              <NavLink to="/invitations" className={linkClass}><i className="bi bi-envelope-open me-1" />Invitations</NavLink>
              <NavLink to="/profile" className={linkClass}><i className="bi bi-person-circle me-1" />Profile</NavLink>
            </div>
          </div>
          {isAuthenticated ? (
            <Button variant="secondary" onClick={handleLogout}><i className="bi bi-box-arrow-right me-1" />Logout</Button>
          ) : (
            <NavLink to="/login" className={linkClass}><i className="bi bi-box-arrow-in-right me-1" />Login</NavLink>
          )}
        </div>
      </nav>
      <main className="container-app py-8">
        <Outlet />
      </main>
    </div>
  )
}
