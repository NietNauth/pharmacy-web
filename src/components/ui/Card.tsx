import React from 'react'
import { cn } from '../../utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = ({ children, className, hover = false, padding = 'md' }: CardProps) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'bg-white border border-border rounded-2xl transition-all duration-200',
        hover && 'hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  )
}
