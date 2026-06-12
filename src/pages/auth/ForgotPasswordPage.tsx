import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Mail, 
  ArrowLeft,
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

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ')
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      setIsLoading(true)
      await authApi.forgotPassword(values.email)
      setIsSent(true)
      toast.success('Yêu cầu đã được gửi!')
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
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
            Khôi phục truy cập tài khoản của bạn.
          </h1>
          
          <div className="space-y-6">
            {[
              { icon: <ShieldCheck />, title: 'An toàn & Bảo mật', desc: 'Mật khẩu của bạn được mã hóa hoàn toàn.' },
              { icon: <Zap />, title: 'Xử lý nhanh chóng', desc: 'Nhận link đặt lại mật khẩu ngay lập tức.' },
              { icon: <Headphones />, title: 'Hỗ trợ kỹ thuật', desc: 'Liên hệ dược sĩ nếu bạn gặp khó khăn.' },
              { icon: <RefreshCw />, title: 'Cập nhật tức thì', desc: 'Sử dụng mật khẩu mới ngay sau khi đổi.' }
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

      {/* Right: Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-base lg:bg-white">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center lg:text-left">
            <Link to="/login" className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all mb-6">
              <ArrowLeft size={18} />
              Quay lại đăng nhập
            </Link>
            <h2 className="text-4xl font-black text-text-primary mb-2">Quên mật khẩu?</h2>
            <p className="text-text-muted font-medium">Đừng lo, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn.</p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Địa chỉ Email"
                type="email"
                placeholder="name@example.com"
                iconLeft={<Mail size={20} />}
                error={errors.email?.message}
                {...register('email')}
              />
              
              <Button 
                type="submit" 
                fullWidth 
                size="lg" 
                loading={isLoading}
                className="shadow-xl shadow-primary/20"
              >
                Gửi yêu cầu khôi phục
              </Button>
            </form>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-emerald-900">Kiểm tra Email của bạn</h3>
              <p className="text-emerald-700 text-sm leading-relaxed">
                Chúng tôi đã gửi một liên kết đặt lại mật khẩu đến địa chỉ email của bạn. Vui lòng kiểm tra cả hòm thư rác nếu không thấy.
              </p>
              <Button 
                variant="outline" 
                fullWidth 
                onClick={() => setIsSent(false)}
                className="mt-4"
              >
                Gửi lại yêu cầu
              </Button>
            </div>
          )}

          <div className="pt-8 text-center border-t border-border">
            <p className="text-text-secondary font-medium">
              Bạn vẫn gặp sự cố?{' '}
              <a href="#" className="text-primary font-black hover:underline underline-offset-4">
                Liên hệ hỗ trợ
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
