import { cn } from '../utils/cn'
import type { EventStatus } from '../features/events/create/services/mockCreateEvent'

interface EventStatusProps {
  status: EventStatus
  className?: string
}

const statusConfig = {
  programado: {
    label: 'Programado',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '⏰'
  },
  en_proceso: {
    label: 'En curso',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🟢'
  },
  finalizado: {
    label: 'Finalizado',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '✅'
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: '❌'
  }
}

export default function EventStatusBadge({ status, className }: EventStatusProps) {
  const config = statusConfig[status]
  
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border',
        config.color,
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}

export function getStatusConfig(status: EventStatus) {
  return statusConfig[status]
}
