import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/Button'

export default function ActivationExpiredPage() {
  return (
    <div className="text-center">
      <h1 className="text-xl font-semibold">Activation link expired</h1>
      <p className="text-sm text-slate-400 mt-1">Request a new activation email to proceed.</p>
      <div className="mt-6">
        <Link to="/register"><Button>Back to register</Button></Link>
      </div>
    </div>
  )
}
