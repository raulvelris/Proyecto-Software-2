import React from 'react'
import { cn } from '../utils/cn'

type Variant = 'info' | 'success' | 'warning' | 'error'

const variantClasses: Record<Variant, string> = {
  info: 'bg-blue-600/10 text-blue-300 border-blue-600/30',
  success: 'bg-emerald-600/10 text-emerald-300 border-emerald-600/30',
  warning: 'bg-amber-600/10 text-amber-300 border-amber-600/30',
  error: 'bg-red-600/10 text-red-300 border-red-600/30',
}

export default function Alert({ children, variant = 'info', className }: { children: React.ReactNode; variant?: Variant; className?: string }) {
  return (
    <div className={cn('rounded-lg border px-4 py-3 text-sm', variantClasses[variant], className)}>
      {children}
    </div>
  )
}
