import React from 'react'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8 py-16', className)}>
      {icon && (
        <div className="w-20 h-20 bg-bg-subtle text-text-muted rounded-3xl flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-black text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-xs mb-8 leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
          {action}
        </div>
      )}
    </div>
  )
}
