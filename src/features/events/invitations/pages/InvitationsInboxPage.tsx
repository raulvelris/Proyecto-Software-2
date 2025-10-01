import React, { useEffect, useState } from 'react'
import EmptyState from '../../../../components/EmptyState'
import { Button } from '../../../../components/Button'
import { toast } from 'sonner'
import { mockListInvitations, mockRespondInvitation } from '../../create/services/mockCreateEvent'
import { useAuthStore } from '../../../../store/authStore'

export default function InvitationsInboxPage() {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState<Array<{ id: string; event: any; toUserEmail: string; status: string }>>([])

  async function load() {
    if (!user) return
    const r = await mockListInvitations(user.email)
    setItems(r.data.invitations)
  }

  useEffect(() => { load() }, [])

  if (!items.length) {
    return <EmptyState title="No invitations" description="You don't have any event invitations yet." />
  }

  async function respond(id: string, accept: boolean) {
    if (!user) return
    try {
      await mockRespondInvitation(id, accept, user.id)
      toast.success(accept ? 'Invitation accepted' : 'Invitation rejected')
      load()
    } catch (e: any) {
      toast.error(e?.message ?? 'Action failed')
    }
  }

  return (
    <div className="space-y-3">
      {items.map((inv) => (
        <div key={inv.id} className="card p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{inv.event.name}</p>
            <p className="text-sm text-slate-400">{new Date(inv.event.date).toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => respond(inv.id, true)}>Accept</Button>
            <Button variant="secondary" onClick={() => respond(inv.id, false)}>Reject</Button>
          </div>
        </div>
      ))}
    </div>
  )
}
