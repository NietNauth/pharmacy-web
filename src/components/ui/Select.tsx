import React from 'react'
import { cn } from '../../utils/cn'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-sm font-semibold text-text-primary ml-1">{label}</label>}
        <select
          ref={ref}
          className={cn(
            'w-full bg-white border border-border rounded-xl px-4 py-2.5 outline-none transition-all appearance-none',
            'focus:border-primary focus:ring-4 focus:ring-primary-light',
            'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D\'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg\'%20fill%3D\'none\'%20viewBox%3D\'0%200%2020%2020\'%3E%3Cpath%20stroke%3D\'%236b7280\'%20stroke-linecap%3D\'round\'%20stroke-linejoin%3D\'round\'%20stroke-width%3D\'1.5\'%20d%3D\'M6%208l4%204%204-4\'%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat',
            error && 'border-error focus:border-error focus:ring-error/10',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-error font-medium ml-1">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
