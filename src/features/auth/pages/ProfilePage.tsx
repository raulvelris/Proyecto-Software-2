import React from 'react'
import { useAuthStore } from '../../../store/authStore'
import Input from '../../../components/Input'
import { Button } from '../../../components/Button'
import { toast } from 'sonner'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.login)

  const [name, setName] = React.useState(user?.name ?? '')
  const [email, setEmail] = React.useState(user?.email ?? '')

  function save() {
    if (!user) return
    setUser({ id: user.id, name, email }, 'mock-token')
    toast.success('Profile updated')
  }

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold">My Profile</h1>
      <p className="text-sm text-slate-400 mb-6">Update your personal information</p>
      <div className="space-y-4 card p-4">
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="flex justify-end">
          <Button onClick={save}><i className="bi bi-save me-1" />Save</Button>
        </div>
      </div>
    </div>
  )
}
