import { toast } from 'sonner'
import { API_CONFIG } from '../../../../config/api'
import { Recurso } from '../services/ResourcesService'

interface ResourceOpenButtonProps {
  recurso: Recurso
}

const HTTP_REGEX = /^https?:\/\//i

function buildExternalUrl(rawUrl: string): string | null {
  if (!rawUrl) return null

  if (HTTP_REGEX.test(rawUrl)) {
    return rawUrl
  }

  return `https://${rawUrl}`
}

function buildFileUrl(rawUrl: string): string | null {
  if (!rawUrl) return null

  if (HTTP_REGEX.test(rawUrl)) {
    return rawUrl
  }

  const normalizedPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  return `${API_CONFIG.ASSETS_BASE_URL}${normalizedPath}`
}

export function ResourceOpenButton({ recurso }: ResourceOpenButtonProps) {
  const tipoRecursoNombre = recurso.tipo_recurso?.nombre?.toLowerCase() || ''
  const esEnlace = tipoRecursoNombre === 'enlace'
  const label = esEnlace ? 'Abrir enlace' : 'Descargar archivo'
  const icon = esEnlace ? 'bi-box-arrow-up-right' : 'bi-download'

  const handleOpen = () => {
    const rawUrl = recurso.url?.trim()

    if (!rawUrl) {
      toast.error('Este recurso no tiene URL disponible')
      return
    }

    const resolvedUrl = esEnlace ? buildExternalUrl(rawUrl) : buildFileUrl(rawUrl)

    if (!resolvedUrl) {
      toast.error('No se pudo construir la URL del recurso')
      return
    }

    window.open(resolvedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
    >
      <i className={`bi ${icon} mr-1`}></i>
      {label}
    </button>
  )
}
