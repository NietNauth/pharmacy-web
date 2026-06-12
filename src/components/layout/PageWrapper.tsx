import React from 'react'
import { cn } from '../../utils/cn'

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageWrapper = ({ 
  children, 
  className, 
  maxWidth = 'xl',
  title,
  subtitle,
  actions
}: PageWrapperProps) => {
  const maxWidths = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div 
      className={cn(
        'container mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-3 duration-500',
        maxWidths[maxWidth],
        className
      )}
    >
      {(title || subtitle || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            {title && <h1 className="text-3xl font-black text-text-primary tracking-tight">{title}</h1>}
            {subtitle && <p className="text-text-muted mt-1 font-medium">{subtitle}</p>}
          </div>
          {actions && (
            <div className="flex items-center gap-3 shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
