import  { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../../../../components/Button'
import { mockInviteUser } from '../../create/services/mockCreateEvent'
import { toast } from 'sonner'
import Modal from '../../../../components/Modal'

interface InviteUsersModalProps {
  open: boolean
  onClose: () => void
}

export default function InviteUsersModal({ open, onClose }: InviteUsersModalProps) {
  const { id } = useParams<{ id: string }>()
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!id) return
    setLoading(true)
    try {
      await mockInviteUser(id, userInput)
      toast.success('Invitation sent')
      setUserInput('')
      onClose()
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not invite user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="max-w-md">
        <h1 className="text-xl font-semibold">Invite Users</h1>
        <p className="text-sm text-slate-400 mb-6">Invite a registered user by email or username</p>
        <div className="card p-4 space-y-3">
          <label className="block text-sm font-medium text-slate-300 mb-1">User email or username</label>
          <div className="flex items-center bg-white/5 rounded-md px-2 focus-within:ring-2 ring-blue-400">
            <i className="bi bi-search text-slate-400 text-lg mr-2" />
            <input
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 outline-none shadow-none text-white placeholder-slate-400 py-2"
              placeholder="Enter email or username"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="flex justify-end mt-3">
            <Button onClick={send} disabled={loading}>
              <i className="bi bi-envelope me-2" />
              {loading ? 'Sending...' : 'Send invite'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
