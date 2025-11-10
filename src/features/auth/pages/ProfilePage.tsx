import React from 'react'
import { useAuthStore } from '../../../store/authStore'
import { API_CONFIG } from '../../../config/api'
import Input from '../../../components/Input'
import { Button } from '../../../components/Button'
import { toast } from 'sonner'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.login)
  const token = useAuthStore((s) => s.token)

  const [firstName, setFirstName] = React.useState(() => (user?.name ?? '').split(' ')[0] ?? '')
  const [lastName, setLastName] = React.useState(() => (user?.name ?? '').split(' ').slice(1).join(' ') ?? '')
  const [email, setEmail] = React.useState(user?.email ?? '')
  const [photo, setPhoto] = React.useState(user?.photo ?? '')
  const [isEditing, setIsEditing] = React.useState(false)

  async function save() {
    if (!user) return
    try {
      const resp = await fetch(`${API_CONFIG.BASE_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: firstName,
          apellido: lastName,
          correo: email,
          foto_perfil: photo,
        }),
      })
      if (!resp.ok) {
        try {
          const err = await resp.json()
          toast.error(err?.message || 'No se pudo actualizar el perfil')
        } catch {
          toast.error('No se pudo actualizar el perfil')
        }
        return
      }
      const data = await resp.json()
      const u = data.user
      setUser(
        {
          id: String(u.usuario_id),
          name: [u.nombre, u.apellido].filter(Boolean).join(' ') || u.correo,
          email: u.correo,
          photo: u.foto_perfil || '',
        },
        token || ''
      )
      toast.success('Perfil actualizado correctamente')
      setIsEditing(false)
    } catch (e) {
      toast.error('Error al actualizar el perfil')
    }
  }

  function cancelEdit() {
    const full = user?.name ?? ''
    setFirstName(full.split(' ')[0] ?? '')
    setLastName(full.split(' ').slice(1).join(' ') ?? '')
    setEmail(user?.email ?? '')
    setPhoto(user?.photo ?? '')
    setIsEditing(false)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {

    const file = e.target.files![0]
    if (file) {
      const allowed = ['image/jpeg', 'image/jpg', 'image/png']
      const maxBytes = 2 * 1024 * 1024
      if (!allowed.includes(file.type)) {
        toast.error('Formato no permitido. Usa JPG o PNG')
        return
      }
      if (file.size > maxBytes) {
        toast.error('La imagen excede 2MB. Reduce el tamaño e inténtalo de nuevo')
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => setPhoto(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return
      try {
        const res = await fetch(`${API_CONFIG.BASE_URL}/profile`, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok) return
        const data = await res.json()
        const u = data.user
        setFirstName(u.nombre ?? '')
        setLastName(u.apellido ?? '')
        setEmail(u.correo)
        setPhoto(u.foto_perfil || '')
      } catch {}
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-lg p-8 text-center">
        {/* Título */}
        <h1 className="text-2xl font-semibold text-slate-100 mb-1">Mi Perfil</h1>
        <p className="text-sm text-slate-300 mb-8">
          Administra tu información personal
        </p>

        {/* Foto de perfil */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <img
              src={
                photo ||
                'https://ui-avatars.com/api/?name=' +
                  encodeURIComponent(`${firstName} ${lastName}`.trim() || 'Usuario') +
                  '&background=1e3a8a&color=ffffff'
              }
              alt="Foto de perfil"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-400 shadow-md"
            />
             {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition-colors">
                <i className="bi bi-camera-fill text-sm"></i>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Campos */}
        <div className="space-y-4 text-left">
          <Input
            label="Nombre"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={!isEditing}
            className="text-slate-100 placeholder-slate-400"
          />
          <Input
            label="Apellido"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={!isEditing}
            className="text-slate-100 placeholder-slate-400"
          />
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isEditing}
            className="text-slate-100 placeholder-slate-400 "
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-2 mt-8">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <i className="bi bi-pencil me-1" />Editar perfil
            </Button>
          ) : (
            <>
              <Button
                onClick={cancelEdit}
                className="bg-slate-600 hover:bg-slate-500 text-white"
              >
                <i className="bi bi-x-circle me-1" />Cancelar
              </Button>
              <Button
                onClick={save}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <i className="bi bi-save me-1" />Guardar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
