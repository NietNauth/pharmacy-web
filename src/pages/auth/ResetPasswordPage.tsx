import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Lock, 
  Eye, 
  EyeOff,
  ShieldCheck,
  Zap,
  Headphones,
  RefreshCw,
  Plus,
  CheckCircle2
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { authApi } from '../../api/auth'
import { toast } from 'react-hot-toast'

const resetPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu phải từ 8 ký tự').regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa').regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 chữ số'),
  password_confirmation: z.string().min(8, 'Mật khẩu phải từ 8 ký tự'),
  token: z.string().min(1, 'Token không hợp lệ')
}).refine((data) => data.password === data.password_confirmation, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["password_confirmation"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      token,
      password: '',
      password_confirmation: ''
    }
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      setIsLoading(true)
      await authApi.resetPassword(values)
      setIsSuccess(true)
      toast.success('Đặt lại mật khẩu thành công!')
      setTimeout(() => navigate('/login'), 3000)
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-600">Lỗi: Token không hợp lệ</h2>
          <p className="text-text-secondary">Liên kết đặt lại mật khẩu của bạn không hợp lệ hoặc đã hết hạn.</p>
          <Link to="/forgot-password">
            <Button variant="primary">Yêu cầu liên kết mới</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left: Banner Section (Desktop) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-sky-500 to-emerald-500 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full -ml-24 -mb-24 blur-3xl" />
        
        <div className="relative z-10 max-w-lg text-white">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-2xl">
              <Plus size={32} strokeWidth={3} />
            </div>
            <span className="text-3xl font-black tracking-tight">PharmaVN</span>
          </Link>
          
          <h1 className="text-5xl font-black mb-8 leading-tight">
            Thiết lập mật khẩu mới cho tài khoản.
          </h1>
          
          <div className="space-y-6">
            {[
              { icon: <ShieldCheck />, title: 'An toàn & Bảo mật', desc: 'Mật khẩu của bạn được mã hóa hoàn toàn.' },
              { icon: <Zap />, title: 'Xử lý nhanh chóng', desc: 'Mật khẩu mới có hiệu lực ngay lập tức.' },
              { icon: <Headphones />, title: 'Hỗ trợ kỹ thuật', desc: 'Liên hệ dược sĩ nếu bạn gặp khó khăn.' },
              { icon: <RefreshCw />, title: 'Đồng bộ tức thì', desc: 'Sử dụng mật khẩu mới trên mọi thiết bị.' }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                <div className="p-2 bg-white/20 rounded-xl">{item.icon}</div>
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="text-sm text-white/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-base lg:bg-white">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-text-primary mb-2">Đặt lại mật khẩu</h2>
            <p className="text-text-muted font-medium">Vui lòng nhập mật khẩu mới để tiếp tục.</p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <input type="hidden" {...register('token')} />
              <Input
                label="Địa chỉ Email"
                type="email"
                readOnly
                className="bg-gray-50"
                iconLeft={<Lock size={20} />}
                {...register('email')}
              />

              <Input
                label="Mật khẩu mới"
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

              <Input
                label="Xác nhận mật khẩu"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                iconLeft={<Lock size={20} />}
                error={errors.password_confirmation?.message}
                {...register('password_confirmation')}
              />
              
              <Button 
                type="submit" 
                fullWidth 
                size="lg" 
                loading={isLoading}
                className="shadow-xl shadow-primary/20"
              >
                Cập nhật mật khẩu
              </Button>
            </form>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-emerald-900">Thành công!</h3>
              <p className="text-emerald-700 text-sm leading-relaxed">
                Mật khẩu của bạn đã được thay đổi thành công. Bạn sẽ được chuyển hướng đến trang đăng nhập trong giây lát.
              </p>
              <Link to="/login">
                <Button fullWidth className="mt-4">Đăng nhập ngay</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
