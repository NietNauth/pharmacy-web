import React from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'prescription'
  className?: string
}

export const Badge = ({ children, variant = 'neutral', className }: BadgeProps) => {
  const variants = {
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    error: 'bg-rose-50 text-rose-600 border-rose-100',
    info: 'bg-sky-50 text-sky-600 border-sky-100',
    neutral: 'bg-gray-50 text-gray-600 border-gray-100',
    prescription: 'bg-rose-100 text-rose-700 border-rose-200 font-bold',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
