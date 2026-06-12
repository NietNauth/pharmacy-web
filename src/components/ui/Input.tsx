import React from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, iconLeft, iconRight, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-sm font-semibold text-text-primary ml-1">{label}</label>}
        <div className="relative group">
          {iconLeft && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
              {iconLeft}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-white border border-border rounded-xl px-4 py-2.5 outline-none transition-all',
              'focus:border-primary focus:ring-4 focus:ring-primary-light',
              error && 'border-error focus:border-error focus:ring-error/10',
              iconLeft && 'pl-11',
              iconRight && 'pr-11',
              className
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
              {iconRight}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-error font-medium ml-1">{error}</p>
        ) : hint ? (
          <p className="text-xs text-text-muted ml-1">{hint}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
