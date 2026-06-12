import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Lock, Eye, EyeOff, Plus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
  remember: z.boolean().optional()
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const setAuth = useAuthStore(state => state.setAuth)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true)
      const res = await authApi.login(values)
      setAuth(res.data.user, res.data.token)
      toast.success(`Chào mừng ${res.data.user.full_name} quay trở lại!`)
      onSuccess?.()
      onClose()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đăng nhập tài khoản" maxWidth="sm">
      <div className="space-y-6">
        <div className="text-center">
          <img src="/logo.png" alt="PharmaVN Logo" className="w-12 h-12 object-contain mx-auto mb-4" />
          <p className="text-sm text-text-muted font-medium">Đăng nhập để tiếp tục sử dụng tất cả dịch vụ của PharmaVN</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Địa chỉ Email"
            type="email"
            placeholder="name@example.com"
            iconLeft={<Mail size={20} />}
            error={errors.email?.message}
            {...register('email')}
          />
          
          <div className="space-y-1">
            <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              iconLeft={<Lock size={20} />}
              iconRight={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded-md border-border text-primary focus:ring-primary/20" {...register('remember')} />
                <span className="text-sm text-text-secondary font-medium group-hover:text-primary transition-colors">Ghi nhớ</span>
              </label>
              <Link to="/forgot-password" onClick={onClose} className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                Quên?
              </Link>
            </div>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            size="md" 
            loading={isLoading}
            className="shadow-lg shadow-primary/20"
          >
            Đăng nhập ngay
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-text-muted font-bold tracking-widest">Hoặc</span></div>
        </div>

        <p className="text-center text-sm text-text-secondary font-medium">
          Chưa có tài khoản?{' '}
          <Link to="/register" onClick={onClose} className="text-primary font-bold hover:underline underline-offset-4">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </Modal>
  )
}
