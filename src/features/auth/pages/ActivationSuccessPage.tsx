import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/Button'

export default function ActivationSuccessPage() {
  return (
    <div className="text-center">
      <h1 className="text-xl font-semibold">Activation email sent</h1>
      <p className="text-sm text-slate-400 mt-1">Please check your inbox to verify your account.</p>
      <div className="mt-6">
        <Link to="/login"><Button>Back to sign in</Button></Link>
      </div>
    </div>
  )
}
