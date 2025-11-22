import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { activateAccount } from '../services/authService'
import { Button } from '../../../components/Button'

export default function ActivateAccountPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Token de activación no proporcionado')
      return
    }

    activateAccount(token)
      .then((response) => {
        setStatus('success')
        setMessage(response.message || '¡Cuenta activada exitosamente!')
      })
      .catch((error) => {
        // Verificar si el token expiró
        if (error.message?.includes('expirado') || error.message?.includes('expired')) {
          setStatus('expired')
          setMessage('El token de activación ha expirado (24 horas)')
        } else {
          setStatus('error')
          setMessage(error.message || 'Error al activar la cuenta')
        }
      })
  }, [token])

  if (status === 'loading') {
    return (
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-slate-600">Activando tu cuenta...</p>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-2">¡Cuenta Activada!</h1>
        <p className="text-sm text-slate-600 mb-6">{message}</p>
        <Button onClick={() => navigate('/login')} className="w-full">
          Iniciar Sesión
        </Button>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-2">Token Expirado</h1>
        <p className="text-sm text-slate-600 mb-2">{message}</p>
        <p className="text-xs text-slate-500 mb-6">Los tokens de activación expiran después de 24 horas por seguridad.</p>
        <Button onClick={() => navigate('/register')} className="w-full">
          Registrarse de Nuevo
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-xl font-semibold mb-2">Error de Activación</h1>
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="space-y-3">
        <Button onClick={() => navigate('/register')} className="w-full">
          Registrarse de Nuevo
        </Button>
        <Button onClick={() => navigate('/login')} variant="secondary" className="w-full">
          Volver al Login
        </Button>
      </div>
    </div>
  )
}
