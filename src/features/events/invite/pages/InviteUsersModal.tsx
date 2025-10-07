import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../../../../components/Button'
import { UsuarioTipo } from '../../../../types/UsuarioTipo'
import Modal from '../../../../components/Modal'
import { buscarUsuarios, invitarUsuario } from '../services/InviteService'
import { toast } from 'sonner'

interface InviteUsersModalProps {
  open: boolean
  onClose: () => void
}

export default function InviteUsersModal({ open, onClose }: InviteUsersModalProps) {
  const { id } = useParams()
  const routeEventId = Number(id)
  const effectiveEventId = Number.isFinite(routeEventId) && routeEventId > 0 ? routeEventId : undefined
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [users, setUsers] = useState<UsuarioTipo[]>([])
  const [selectedUser, setSelectedUser] = useState<UsuarioTipo | null>(null)

  // Devuelve el nombre completo desde Cliente/cliente o campos planos (para respuestas raw)
  const getUserFullName = (user: UsuarioTipo): string => {
    const anyUser = user as any
    const cliente = user.Cliente || anyUser.cliente
    const nombre: string | undefined = anyUser.nombre || cliente?.nombre
    const apellido: string | undefined = anyUser.apellido || cliente?.apellido
    const full = `${nombre ?? ''} ${apellido ?? ''}`.trim()
    return full
  }

  // Debounce para la búsqueda
  const debounceSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(async () => {
          if (query.trim()) {
            setSearching(true)
            try {
              const results = await buscarUsuarios(query);
              setUsers(results);
            } catch (error) {
              console.error('Error searching users:', error);
              setUsers([]);
            } finally {
              setSearching(false)
            }
          } else {
            setUsers([])
          }
        }, 300)
      }
    })(),
    []
  )

  // Efecto para la búsqueda con debounce
  useEffect(() => {
    debounceSearch(userInput)
  }, [userInput, debounceSearch])

  // Limpiar estado cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      setUserInput('')
      setUsers([])
      setSelectedUser(null)
    }
  }, [open])

  const handleUserSelect = (user: UsuarioTipo) => {
    setSelectedUser(user)
    setUserInput('')
    setUsers([])
  }

  const handleSendInvitation = async () => {
    if (!selectedUser || !effectiveEventId) {
      toast.error('Please select a user and ensure event ID is provided')
      return
    }

    setLoading(true)
    try {
      await invitarUsuario(effectiveEventId, selectedUser.usuario_id)
      toast.success(`Invitation sent to ${selectedUser.correo}`)
      onClose()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="max-w-md">
        <h1 className="text-xl font-semibold">Invite Users</h1>
        <p className="text-sm text-slate-400 mb-6">Invite a registered user by name or email</p>
        
        <div className="card p-4 space-y-3">
          <label className="block text-sm font-medium text-slate-300 mb-1">Search by name or email</label>
          <div className="relative">
            <div className="flex items-center bg-white/5 rounded-md px-2 focus-within:ring-2 ring-blue-400">
              <i className="bi bi-search text-slate-400 text-lg mr-2" />
              <input
                type="text"
                className="flex-1 bg-transparent border-none focus:ring-0 outline-none shadow-none text-white placeholder-slate-400 py-2"
                placeholder="Enter name or email"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                autoComplete="off"
                disabled={!!selectedUser}
              />
              {searching && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              )}
            </div>
            
            {/* Dropdown de resultados */}
            {users.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur border border-white/20 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user.usuario_id}
                    className="px-3 py-2 hover:bg-white/10 cursor-pointer border-b border-white/10 last:border-b-0"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="text-white text-sm font-medium">
                      {getUserFullName(user) || user.correo}
                    </div>
                    <div className="text-slate-400 text-xs">{user.correo}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usuario seleccionado */}
          {selectedUser && (
            <div className="bg-blue-600/20 border border-blue-600/30 rounded-md p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-300 text-sm font-medium">
                    {getUserFullName(selectedUser) || selectedUser.correo}
                  </div>
                  <div className="text-blue-400 text-xs">{selectedUser.correo}</div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-3">
            <Button 
              onClick={handleSendInvitation} 
              disabled={loading || !selectedUser}
            >
              <i className="bi bi-envelope me-2" />
              {loading ? 'Sending...' : 'Send invite'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}



