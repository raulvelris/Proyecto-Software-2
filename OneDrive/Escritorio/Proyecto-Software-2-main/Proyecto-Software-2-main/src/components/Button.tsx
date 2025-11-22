import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../utils/cn'
import React from 'react'

const buttonStyles = cva(
  'inline-flex items-center justify-center rounded-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-soft',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 hover:bg-blue-500 text-white',
        secondary: 'bg-white/10 hover:bg-white/15 text-slate-100',
        ghost: 'bg-transparent hover:bg-white/5 text-slate-200',
        danger: 'bg-red-600 hover:bg-red-500 text-white',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button ref={ref} className={cn(buttonStyles({ variant, size }), className)} {...props} />
    )
  }
)
Button.displayName = 'Button'

export default Button
