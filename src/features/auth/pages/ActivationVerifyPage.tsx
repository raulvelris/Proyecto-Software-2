import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { mockActivate } from '../services/mockAuth'
import { useAuthStore } from '../../../store/authStore'
import { toast } from 'sonner'

export default function ActivationVerifyPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [message, setMessage] = useState('Verifying...')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const email = params.get('email')
    const token = params.get('token')
    if (!email || !token) {
      setMessage('Invalid activation link')
      return
    }
    mockActivate(email, token)
      .then((r) => {
        login(r.data.user, r.data.token)
        toast.success('Account activated!')
        navigate('/events/public', { replace: true })
      })
      .catch((e: any) => {
        setMessage(e?.message ?? 'Activation failed')
      })
  }, [location.search, login, navigate])

  return (
    <div className="text-center">
      <p className="text-sm text-slate-300">{message}</p>
    </div>
  )
}


