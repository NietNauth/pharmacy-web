import React from 'react'
import { cn } from '../../utils/cn'
import { Spinner } from './Spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  isLoading?: boolean
  fullWidth?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
}

export const Button = (props: ButtonProps) => {
  const {
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    isLoading = false,
    fullWidth = false,
    iconLeft,
    iconRight,
    disabled,
    ...rest
  } = props;

  const isButtonLoading = loading || isLoading;

  const variants = {
    primary: 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5',
    secondary: 'bg-white border border-border text-text-primary hover:bg-bg-subtle hover:border-primary/30 hover:text-primary hover:-translate-y-0.5 shadow-sm',
    success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-0.5',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white hover:-translate-y-0.5',
    ghost: 'text-text-muted hover:bg-primary/5 hover:text-primary',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-200 hover:-translate-y-0.5',
  }

  const sizes = {
    sm: 'px-4 py-2 text-[10px] gap-1.5',
    md: 'px-6 py-2.5 text-xs gap-2',
    lg: 'px-6 py-3 text-sm gap-2',
  }

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center font-black transition-all duration-300 active:scale-[0.95] disabled:opacity-40 disabled:pointer-events-none rounded-2xl tracking-tight overflow-hidden group whitespace-nowrap',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isButtonLoading}
      {...rest}
    >
      {isButtonLoading ? (
        <Spinner size="sm" color={variant === 'secondary' || variant === 'ghost' || variant === 'outline' ? 'primary' : 'white'} />
      ) : (
        <>
          <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
          {iconLeft && <span className="shrink-0 z-10">{iconLeft}</span>}
          <span className="z-10 whitespace-nowrap flex items-center gap-[inherit]">{children}</span>
          {iconRight && <span className="shrink-0 z-10">{iconRight}</span>}
        </>
      )}
    </button>
  )
}
