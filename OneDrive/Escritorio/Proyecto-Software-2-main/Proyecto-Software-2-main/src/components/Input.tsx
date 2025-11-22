import React from 'react'
import { cn } from '../utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && <label className="label">{label}</label>}
      <input {...props} className={cn('input', error && 'ring-2 ring-red-500/40 focus:ring-red-500/40')} />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  )
}
