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

  const [activeTab, setActiveTab] = useState<'attendees' | 'coorganizers'>('attendees')
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [users, setUsers] = useState<UsuarioTipo[]>([])
  const [noEligibleUsers, setNoEligibleUsers] = useState<NoEligibleItem[]>([])

  // Attendees
  const [selectedAttendees, setSelectedAttendees] = useState<UsuarioTipo[]>([])
  const [pendientesAttendees, setPendientesAttendees] = useState(0)
  const [limiteAttendees, setLimiteAttendees] = useState(0)

  // Coorganizers
  const [selectedCoorganizers, setSelectedCoorganizers] = useState<UsuarioTipo[]>([])
  const [pendientesCoorganizers, setPendientesCoorganizers] = useState(0)
  const [limiteCoorganizers, setLimiteCoorganizers] = useState(0)

  const getUserFullName = (user: UsuarioTipo) => {
    const anyUser = user as any
    const cliente = user.Cliente ?? anyUser.cliente
    const nombre: string = anyUser.nombre ?? cliente?.nombre
    const apellido: string = anyUser.apellido ?? cliente?.apellido
    return `${nombre ?? ''} ${apellido ?? ''}`.trim()
  }

  // Solo ocultar usuarios ya seleccionados (sin tocar noElegibles)
  const debounceSearch = useCallback(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    return (query: string) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(async () => {
        if (!query.trim()) return setUsers([])
        setSearching(true)
        try {
          const results = await buscarUsuarios(query)

          const filtered = results.filter(u => {
            const uid = Number(u.usuario_id)
            const selectedInAttendees = selectedAttendees.some(s => Number(s.usuario_id) === uid)
            const selectedInCoorgs   = selectedCoorganizers.some(s => Number(s.usuario_id) === uid)
            return !selectedInAttendees && !selectedInCoorgs
          })

          setUsers(filtered)
        } catch {
          setUsers([])
        } finally {
          setSearching(false)
        }
      }, 300)
    }
  }, [selectedAttendees, selectedCoorganizers])

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
        setPendientesAttendees(data.pendientesParaAsistente)
        setLimiteAttendees(data.limiteAsistentes)
        setPendientesCoorganizers(data.pendientesParaCoorganizador)
        setLimiteCoorganizers(data.limiteCoorganizadores)
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
      setSelectedAttendees([])
      setSelectedCoorganizers([])
    }
  }, [open])

  const currentSelected =
    activeTab === 'attendees' ? selectedAttendees : selectedCoorganizers
  const setCurrentSelected =
    activeTab === 'attendees' ? setSelectedAttendees : setSelectedCoorganizers
  const currentPendientes =
    activeTab === 'attendees' ? pendientesAttendees : pendientesCoorganizers
  const currentLimite = activeTab === 'attendees' ? limiteAttendees : limiteCoorganizers
  const bloqueado = currentPendientes + currentSelected.length >= currentLimite

  const handleUserSelect = (user: UsuarioTipo) => {
    const uid = Number(user.usuario_id)
    const maxSelected = 10
    const totalSelected = selectedAttendees.length + selectedCoorganizers.length

    if (totalSelected >= maxSelected) {
      toast.error(`You can select up to ${maxSelected} users only`)
      return
    }

    if (currentSelected.some(u => u.usuario_id === uid)) {
      const role = activeTab === 'attendees' ? 'attendee' : 'co-organizer'
      toast.error(`${getUserFullName(user)} is already selected as ${role}`)
      return
    }

    const otherList = activeTab === 'attendees' ? selectedCoorganizers : selectedAttendees
    if (otherList.some(u => u.usuario_id === uid)) {
      const otherRole = activeTab === 'attendees' ? 'co-organizer' : 'attendee'
      toast.error(`${getUserFullName(user)} is already selected as ${otherRole}`)
      return
    }

    const existing = noEligibleUsers.find(u => u.usuario_id === uid)
    if (existing) {
      if (existing.tipo === 'pendiente_asistente') {
        toast.error(`${getUserFullName(user)} has a pending invitation as an attendee`)
      } else if (existing.tipo === 'pendiente_coorganizador') {
        toast.error(`${getUserFullName(user)} has a pending invitation as a co-organizer`)
      } else if (existing.tipo === 'participante') {
        toast.error(`${getUserFullName(user)} is already participating`)
      }
      return
    }

    if (bloqueado) {
      toast.error('Invitation limit reached')
      return
    }

    setCurrentSelected(prev => [...prev, user])
    setUserInput('')
    setUsers([])
  }

  const handleRemoveSelected = (usuario_id: number | string, type: 'attendees' | 'coorganizers') => {
    if (type === 'attendees') {
      setSelectedAttendees(prev => prev.filter(u => u.usuario_id !== usuario_id))
    } else {
      setSelectedCoorganizers(prev => prev.filter(u => u.usuario_id !== usuario_id))
    }
  }

  const handleSendInvitation = async () => {
    const totalSelected = selectedAttendees.length + selectedCoorganizers.length
    if (!effectiveEventId || totalSelected === 0) {
      toast.error('Select at least one user and ensure event ID is provided')
      return
    }

    setLoading(true)
    try {
      const allUsers = [
        ...selectedAttendees.map(u => ({
          usuario_id: u.usuario_id,
          esParaCoorganizar: false
        })),
        ...selectedCoorganizers.map(u => ({
          usuario_id: u.usuario_id,
          esParaCoorganizar: true
        }))
      ]

      const result = await invitarUsuarios(effectiveEventId, allUsers)
      const resultados = result.resultados ?? []

      let sentAttendees = 0
      let sentCoorganizers = 0
      let alreadyCount = 0
      let notFoundCount = 0

      resultados.forEach((r: any) => {
        if (r.status === 'Invitation sent') {
          if (r.esParaCoorganizar) {
            sentCoorganizers++
          } else {
            sentAttendees++
          }
        } else if (r.status === 'Already invited') {
          alreadyCount++
        } else if (r.status === 'User not found') {
          notFoundCount++
        }
      })

      if (sentAttendees > 0 || sentCoorganizers > 0) {
        const attendeeText = sentAttendees > 0 ? `${sentAttendees} user(s) as attendee(s)` : '';
        const separator = sentAttendees > 0 && sentCoorganizers > 0 ? ' and ' : '';
        const coorganizerText = sentCoorganizers > 0 ? `${sentCoorganizers} user(s) as co-organizer(s)` : '';
        toast.success(`Successfully invited: ${attendeeText}${separator}${coorganizerText}`);
      }

      if (alreadyCount) toast.error(`${alreadyCount} user(s) were already invited`)
      if (notFoundCount) toast.error(`${notFoundCount} user(s) not found`)

      const nuevosNoEligibles = resultados
        .filter(r => r.status === 'Invitation sent')
        .map(r => ({
          usuario_id: Number(r.usuario_id),
          tipo: r.esParaCoorganizar ? 'pendiente_coorganizador' as const : 'pendiente_asistente' as const
        }))

      // Actualizar estados
      setNoEligibleUsers(prev => [...prev, ...nuevosNoEligibles])
      setPendientesAttendees(prev => prev + sentAttendees)
      setPendientesCoorganizers(prev => prev + sentCoorganizers)

      setSelectedAttendees([])
      setSelectedCoorganizers([])
    } catch (err: any) {
      console.error('Error sending invitations:', err)
      toast.error(err.message ?? 'Failed to send invitations')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      {/* ENCABEZADO DE TABS */}
      <div className="flex w-full border-b border-white/20 mb-4">
        <button
          className="flex-1 py-2 font-semibold transition-colors"
          style={{
            backgroundColor: activeTab === 'attendees' ? '#1E293B' : '#334155',
            color: activeTab === 'attendees' ? '#fff' : '#94A3B8',
            borderBottom: activeTab === 'attendees' ? '3px solid #3B82F6' : '3px solid transparent',
          }}
          onClick={() => setActiveTab('attendees')}
        >
          Attendees
        </button>
        <button
          className="flex-1 py-2 font-semibold transition-colors"
          style={{
            backgroundColor: activeTab === 'coorganizers' ? '#1E293B' : '#334155',
            color: activeTab === 'coorganizers' ? '#fff' : '#94A3B8',
            borderBottom: activeTab === 'coorganizers' ? '3px solid #3B82F6' : '3px solid transparent',
          }}
          onClick={() => setActiveTab('coorganizers')}
        >
          Co-organizers
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="max-w-md">
        <h1 className="text-xl font-semibold text-white mb-1">
          {activeTab === 'attendees' ? 'Invite Attendees' : 'Invite Co-organizers'}
        </h1>
        <p className="text-sm text-slate-400 mb-2">
          {activeTab === 'attendees'
            ? 'Invite attendees to enjoy the event'
            : 'Invite co-organizers with management access'}
        </p>
        <p className="text-sm text-slate-400 mb-4">
          {currentPendientes} / {currentLimite} pending invitations
        </p>

        {/* Buscador */}
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
            {bloqueado && (
              <p className="text-red-400 text-xs mt-1">
                Invitation limit reached
              </p>
            )}
            {users.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur border border-white/20 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {users.map(user => {
                  const uid = Number(user.usuario_id)
                  const tipo = noEligibleUsers.find(u => u.usuario_id === uid)?.tipo
                  const isBlocked = Boolean(tipo)
                  const mensaje =
                    tipo === 'pendiente_asistente'
                      ? 'Asistente pendiente'
                      : tipo === 'pendiente_coorganizador'
                      ? 'Coorganizador pendiente'
                      : tipo === 'participante'
                      ? 'Ya está participando'
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

          {/* Usuarios seleccionados */}
          {(selectedAttendees.length > 0 || selectedCoorganizers.length > 0) && (
            <div
              className="space-y-3 mt-2 overflow-y-auto"
              style={{
                maxHeight: '220px', // limita el alto del bloque de seleccionados
                overflowY: 'auto',
                paddingRight: '4px', // pequeño espacio para scrollbar
              }}
            >
              {selectedAttendees.length > 0 && (
                <div>
                  <h3 className="text-blue-400 font-semibold text-sm mb-1">Selected Attendees</h3>
                  {selectedAttendees.map(user => (
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
                        onClick={() => handleRemoveSelected(user.usuario_id, 'attendees')}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedCoorganizers.length > 0 && (
                <div>
                  <h3 className="text-purple-400 font-semibold text-sm mb-1">Selected Co-organizers</h3>
                  {selectedCoorganizers.map(user => (
                    <div
                      key={user.usuario_id}
                      className="bg-purple-600/20 border border-purple-600/30 rounded-md p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="text-purple-300 text-sm font-medium">
                          {getUserFullName(user) || user.correo}
                        </div>
                        <div className="text-purple-400 text-xs">{user.correo}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveSelected(user.usuario_id, 'coorganizers')}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end mt-3">
            <Button
              onClick={handleSendInvitation}
              disabled={
                loading ||
                (selectedAttendees.length === 0 && selectedCoorganizers.length === 0)
              }
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

