import React from 'react'
import { cn } from '../../utils/cn'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rect' | 'circle'
}

export const Skeleton = ({ className, variant = 'rect' }: SkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 relative overflow-hidden',
        'after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'rect' && 'rounded-xl',
        variant === 'circle' && 'rounded-full',
        className
      )}
    />
  )
}
