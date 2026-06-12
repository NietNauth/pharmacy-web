import React from 'react'
import { cn } from '../../utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'white' | 'primary'
  className?: string
}

export const Spinner = ({ size = 'md', color = 'primary', className }: SpinnerProps) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  }

  const colors = {
    white: 'border-white/30 border-t-white',
    primary: 'border-primary-light border-t-primary',
  }

  return (
    <div
      className={cn(
        'rounded-full animate-spin',
        sizes[size],
        colors[color],
        className
      )}
    />
  )
}
