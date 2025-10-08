import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '../../../components/Button'
import { mockGetActivationLink } from '../services/mockAuth'

export default function ActivationSuccessPage() {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const email = params.get('email') ?? ''
  const [activationUrl, setActivationUrl] = useState<string>('')

  useEffect(() => {
    if (!email) return
    mockGetActivationLink(email).then((r) => setActivationUrl(r.data.url)).catch(() => setActivationUrl(''))
  }, [email])

  return (
    <div className="text-center">
      <h1 className="text-xl font-semibold">Activation email sent</h1>
      <p className="text-sm text-slate-400 mt-1">Please check your inbox to verify your account.</p>
      {activationUrl && (
        <div className="mt-6">
          <Link to={activationUrl}><Button>Activa tu cuenta</Button></Link>
        </div>
      )}
      {!activationUrl && (
        <div className="mt-6">
          <Link to="/login"><Button>Back to sign in</Button></Link>
        </div>
      )}
    </div>
  )
}
