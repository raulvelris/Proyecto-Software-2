import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Input from '../../../../components/Input'
import { Button } from '../../../../components/Button'
import { mockInviteUser } from '../../create/services/mockCreateEvent'
import { toast } from 'sonner'

export default function InviteUsersPage() {
  const { id } = useParams<{ id: string }>()
  const [email, setEmail] = useState('')

  async function send() {
    if (!id) return
    try {
      await mockInviteUser(id, email)
      toast.success('Invitation sent')
      setEmail('')
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not invite user')
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold">Invite Users</h1>
      <p className="text-sm text-slate-400 mb-6">Invite a registered user by email</p>
      <div className="card p-4 space-y-3">
        <Input label="User email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="flex justify-end">
          <Button onClick={send}><i className="bi bi-envelope me-2" />Send invite</Button>
        </div>
      </div>
    </div>
  )
}
