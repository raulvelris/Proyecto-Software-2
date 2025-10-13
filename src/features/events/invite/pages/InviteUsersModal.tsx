import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../../../../components/Button'
import { UsuarioTipo } from '../../../../types/UsuarioTipo'
import Modal from '../../../../components/Modal'
import { buscarUsuarios, invitarUsuarios, obtenerNoElegibles, obtenerConteoPendientes } from '../services/InviteService'
import { NoEligibleItem } from '../services/InviteService'
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
  const [selectedUsers, setSelectedUsers] = useState<UsuarioTipo[]>([])
  const [noEligibleUsers, setNoEligibleUsers] = useState<NoEligibleItem[]>([]) // era invited, ahora no eligible
  const [pendientes, setPendientes] = useState(0)
  const [limite, setLimite] = useState(0)

  const getUserFullName = (user: UsuarioTipo) => {
    const anyUser = user as any
    const cliente = user.Cliente ?? anyUser.cliente
    const nombre: string = anyUser.nombre ?? cliente.nombre
    const apellido: string = anyUser.apellido ?? cliente.apellido
    return `${nombre ?? ''} ${apellido ?? ''}`.trim()
  }

  const debounceSearch = useCallback(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    return (query: string) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(async () => {
        if (!query.trim()) return setUsers([])
        setSearching(true)
        try {
          const results = await buscarUsuarios(query)
          setUsers(results)
        } catch {
          setUsers([])
        } finally {
          setSearching(false)
        }
      }, 300)
    }
  }, [])

  useEffect(() => {
    const debounced = debounceSearch()
    debounced(userInput)
  }, [userInput, debounceSearch])

  useEffect(() => {
    if (!open || !effectiveEventId) return
    const fetchInvitedUsers = async () => {
      try {
        const noElegibles = await obtenerNoElegibles(effectiveEventId)
        setNoEligibleUsers(noElegibles)
      } catch (err) {
        console.error(err)
      }
    }
    fetchInvitedUsers()
  }, [open, effectiveEventId])

  useEffect(() => {
    if (!open || !effectiveEventId) return
    const fetchPendientes = async () => {
      try {
        const data = await obtenerConteoPendientes(effectiveEventId)
        setPendientes(data.pendientes)
        setLimite(data.limite)
      } catch (err) {
        console.error(err)
      }
    }
    fetchPendientes()
  }, [open, effectiveEventId])

  useEffect(() => {
    if (!open) {
      setUserInput('')
      setUsers([])
      setSelectedUsers([])
    }
  }, [open])

  const bloqueado = pendientes + selectedUsers.length >= limite

  const handleUserSelect = (user: UsuarioTipo) => {
    const uid = Number(user.usuario_id)
    const maxSelected = 10

    if (selectedUsers.length >= maxSelected) {
      toast.error(`You can select up to ${maxSelected} users only`);
      return
    }

    const existing = noEligibleUsers.find(u => u.usuario_id === uid)
    if (existing) {
      if (existing.tipo === 'pendiente') {
        toast.error(`${getUserFullName(user)} has a pending invitation`)
      } else if (existing.tipo === 'participante') {
        toast.error(`${getUserFullName(user)} is already participating`)
      }
      return
    }    

    if (bloqueado) {
      toast.error('Ya se ha cubierto el límite de invitaciones pendientes')
      return
    }

    if (!selectedUsers.find(u => u.usuario_id === uid)) {
      setSelectedUsers(prev => [...prev, user])
    }

    setUserInput('')
    setUsers([])
  }

  const handleRemoveSelected = (usuario_id: number | string) => {
    setSelectedUsers(prev => prev.filter(u => u.usuario_id !== usuario_id))
  }

  const handleSendInvitation = async () => {
    if (!effectiveEventId || selectedUsers.length === 0) {
      toast.error('Select at least one user and ensure event ID is provided')
      return
    }
  
    setLoading(true)
    try {
      const result = await invitarUsuarios(
        effectiveEventId,
        selectedUsers.map(u => u.usuario_id)
      )
      const resultados = result.resultados ?? []
  
      // Contadores
      let sentCount = 0
      let alreadyCount = 0
      let notFoundCount = 0
  
      resultados.forEach((r: any) => {
        if (r.status === 'Invitation sent') sentCount++
        else if (r.status === 'Already invited') alreadyCount++
        else if (r.status === 'User not found') notFoundCount++
      })
  
      // Mostrar toasts resumidos
      if (sentCount) toast.success(`${sentCount} user(s) invited successfully`)
      if (alreadyCount) toast.error(`${alreadyCount} user(s) were already invited`)
      if (notFoundCount) toast.error(`${notFoundCount} user(s) not found`)
  
      // Actualizar estados
      setNoEligibleUsers(prev => [
        ...prev,
        ...resultados
          .filter(r => r.status === 'Invitation sent')
          .map((r: any) => ({
            usuario_id: Number(r.usuario_id),
            tipo: 'pendiente' as const
          }))
      ])
      setPendientes(prev =>
        prev + resultados.filter(r => r.status === 'Invitation sent').length
      )
      setSelectedUsers([])
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to send invitations')
    } finally {
      setLoading(false)
    }
  }  

  return (
    <Modal open={open} onClose={onClose}>
      <div className="max-w-md">
        <h1 className="text-xl font-semibold">Invite Users</h1>
        <p className="text-sm text-slate-400 mb-6">Invite registered users by name or email</p>
        <p className="text-sm text-slate-400 mb-4">{pendientes} / {limite} pending invitations</p>

        <div className="card p-4 space-y-3">
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Search by name or email
          </label>

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
                disabled={bloqueado}
              />
              {searching && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
              )}
            </div>

            {/* Mensaje de límite alcanzado */}
            {bloqueado && (
              <p className="text-red-400 text-xs mt-1">
                Ya se ha cubierto el límite de invitaciones pendientes
              </p>
            )}

            {users.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur border border-white/20 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {users.map(user => {
                  const uid = Number(user.usuario_id)
                  const tipo = noEligibleUsers.find(u => u.usuario_id === uid)?.tipo

                   // Determinar si está bloqueado y el mensaje según tipo
                  const isBlocked = Boolean(tipo)
                  const mensaje = tipo === 'pendiente'
                    ? 'Pending invitation'
                    : tipo === 'participante'
                    ? 'Already participating'
                    : ''

                  return (
                    <div
                      key={uid}
                      className={`px-3 py-2 border-b border-white/10 last:border-b-0 ${
                        isBlocked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/10 cursor-pointer'
                      }`}
                      onClick={() => !isBlocked && handleUserSelect(user)}
                    >
                      <div className="text-white text-sm font-medium">
                        {getUserFullName(user) || user.correo} {mensaje && `- ${mensaje}`}
                      </div>
                      <div className="text-slate-400 text-xs">{user.correo}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {selectedUsers.map(user => (
                <div
                  key={user.usuario_id}
                  className="bg-blue-600/20 border border-blue-600/30 rounded-md p-3 flex justify-between items-center"
                >
                  <div>
                    <div className="text-blue-300 text-sm font-medium">
                      {getUserFullName(user) || user.correo}
                    </div>
                    <div className="text-blue-400 text-xs">{user.correo}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveSelected(user.usuario_id)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-3">
            <Button onClick={handleSendInvitation} disabled={loading || selectedUsers.length === 0}>
              <i className="bi bi-envelope me-2" />
              {loading ? 'Sending...' : 'Send invite'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
