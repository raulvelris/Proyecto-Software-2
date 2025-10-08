import { useState } from 'react'
import { Button } from '../../../../components/Button'
import { toast } from 'sonner'
import { useParams } from 'react-router-dom'

export default function InviteUsersPage() {
  const { id } = useParams()
  const [emailsText, setEmailsText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const emails = emailsText
    .split(/[\s,;]+/)
    .map((e) => e.trim())
    .filter((e) => e.length > 0)

  async function handleInvite() {
    if (!id) {
      toast.error('Missing event id')
      return
    }
    if (!emails.length) {
      toast.error('Add at least one email')
      return
    }
    setSubmitting(true)
    try {
      // Mock invite behavior
      await new Promise((r) => setTimeout(r, 600))
      toast.success(`Invitations sent to ${emails.length} user(s) for event ${id}`)
      setEmailsText('')
    } catch (e: any) {
      toast.error(e?.message ?? 'Failed to send invitations')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold">Invite users</h1>
      <p className="text-sm text-slate-400 mb-6">Paste or type emails separated by commas or spaces.</p>

      <label className="block text-sm font-medium mb-2">Emails</label>
      <textarea
        className="input min-h-[120px]"
        rows={5}
        placeholder="user1@mail.com, user2@mail.com ..."
        value={emailsText}
        onChange={(e) => setEmailsText(e.target.value)}
      />

      <div className="mt-4 flex items-center gap-2">
        <Button onClick={handleInvite} disabled={submitting || !emails.length}>
          <i className="bi bi-send me-2" />Send invitations
        </Button>
        <span className="text-xs text-slate-400">{emails.length} to invite</span>
      </div>
    </div>
  )
}


