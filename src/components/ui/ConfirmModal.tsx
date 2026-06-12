import React from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../../utils/cn'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'primary'
  loading?: boolean
  icon?: React.ReactNode
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'primary',
  loading = false,
  icon
}: ConfirmModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-[400px] rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-6">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-transform duration-500",
            variant === 'danger' ? "bg-rose-50 text-rose-500" : 
            variant === 'warning' ? "bg-amber-50 text-amber-500" : "bg-sky-50 text-primary"
          )}>
            {icon || <AlertCircle size={32} strokeWidth={2.5} />}
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-black text-text-primary tracking-tight">{title}</h3>
            <div className="text-[13px] text-text-secondary font-medium leading-relaxed px-2">
              {description}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              fullWidth 
              onClick={onClose}
              className="font-bold rounded-2xl h-12 border-sky-400 text-sky-500 hover:bg-sky-50"
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button 
              variant="primary"
              fullWidth 
              onClick={onConfirm}
              loading={loading}
              className={cn(
                "font-black rounded-2xl h-12 shadow-lg",
                variant === 'danger' ? "bg-[#FF4D4F] hover:bg-rose-600 shadow-rose-500/20" : "bg-primary shadow-primary/20"
              )}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

