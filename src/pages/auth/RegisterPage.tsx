import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone,
  CheckCircle2
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { authApi } from '../../api/auth'
import { toast } from 'react-hot-toast'
import { cn } from '../../utils/cn'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Họ tên quá ngắn'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, 'Số điện thoại không hợp lệ'),
  password: z.string()
    .min(8, 'Mật khẩu phải từ 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số'),
  password_confirmation: z.string(),
  terms: z.literal(true, {
    errorMap: () => ({ message: 'Bạn phải đồng ý với điều khoản sử dụng' })
  })
}).refine((data) => data.password === data.password_confirmation, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["password_confirmation"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  })

  const passwordValue = watch('password', '')
  const confirmPasswordValue = watch('password_confirmation', '')
  
  const hasLength = passwordValue.length >= 8
  const hasUpperLower = /[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue)
  const hasNumber = /[0-9]/.test(passwordValue)
  const isMatching = passwordValue === confirmPasswordValue && confirmPasswordValue !== ''

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true)
      await authApi.register(values)
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.', {
        duration: 5000,
        icon: '📧'
      })
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left: Illustration Banner (Desktop) */}
      <div className="hidden lg:flex flex-1 bg-sky-50 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full -ml-20 -mb-20" />
        
        <div className="relative z-10 text-center space-y-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src="/logo.png" alt="PharmaVN Logo" className="w-12 h-12 object-contain" />
            <img src="/logo-text.png" alt="PharmaVN" className="h-10 object-contain" />
          </Link>
          
          <div className="max-w-md mx-auto">
            <img 
              src="https://img.freepik.com/free-vector/doctors-concept-illustration_114360-1515.jpg" 
              alt="Healthcare Illustration" 
              className="w-full mix-blend-multiply opacity-80"
            />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-text-primary">Tham gia cộng đồng sức khỏe</h2>
            <p className="text-text-secondary font-medium px-8 leading-relaxed">
              Nhận ngay ưu đãi đặc quyền, tư vấn miễn phí và quản lý hồ sơ sức khỏe thông minh cùng PharmaVN.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-text-primary mb-2">Đăng ký</h2>
            <p className="text-sm text-text-muted font-medium">Trở thành thành viên PharmaVN chỉ trong vài giây</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              iconLeft={<User size={20} />}
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Địa chỉ Email"
                type="email"
                placeholder="name@example.com"
                iconLeft={<Mail size={20} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Số điện thoại"
                placeholder="0912345678"
                iconLeft={<Phone size={20} />}
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

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

            <Input
              label="Xác nhận mật khẩu"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              iconLeft={<Lock size={20} />}
              error={errors.password_confirmation?.message}
              {...register('password_confirmation')}
            />

            <div className="bg-bg-subtle p-4 rounded-2xl border border-border mt-2">
              <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Quy định mật khẩu:</h5>
              <ul className="space-y-1.5">
                <li className={cn(
                  "text-[10px] font-bold flex items-center gap-2 transition-colors",
                  hasLength ? "text-emerald-500" : "text-text-secondary opacity-50"
                )}>
                  <CheckCircle2 size={12} className={cn(hasLength ? "fill-emerald-500/10" : "")} /> Tối thiểu 8 ký tự
                </li>
                <li className={cn(
                  "text-[10px] font-bold flex items-center gap-2 transition-colors",
                  hasUpperLower ? "text-emerald-500" : "text-text-secondary opacity-50"
                )}>
                  <CheckCircle2 size={12} className={cn(hasUpperLower ? "fill-emerald-500/10" : "")} /> Bao gồm chữ hoa và chữ thường
                </li>
                <li className={cn(
                  "text-[10px] font-bold flex items-center gap-2 transition-colors",
                  hasNumber ? "text-emerald-500" : "text-text-secondary opacity-50"
                )}>
                  <CheckCircle2 size={12} className={cn(hasNumber ? "fill-emerald-500/10" : "")} /> Bao gồm ít nhất 1 chữ số
                </li>
                <li className={cn(
                  "text-[10px] font-bold flex items-center gap-2 transition-colors",
                  isMatching ? "text-emerald-500" : "text-text-secondary opacity-50"
                )}>
                  <CheckCircle2 size={12} className={cn(isMatching ? "fill-emerald-500/10" : "")} /> Mật khẩu xác nhận trùng khớp
                </li>
              </ul>
            </div>

            <label className="flex items-start gap-3 p-1 cursor-pointer group">
              <input 
                type="checkbox" 
                className="mt-1 w-4 h-4 rounded-md border-border text-primary focus:ring-primary/20" 
                {...register('terms')}
              />
              <span className="text-sm text-text-secondary leading-snug">
                Tôi đồng ý với <Link to="/terms" className="text-primary font-bold hover:underline">Điều khoản sử dụng</Link> và <Link to="/privacy" className="text-primary font-bold hover:underline">Chính sách bảo mật</Link> của PharmaVN.
              </span>
            </label>
            {errors.terms && <p className="text-xs text-error font-medium ml-1">{errors.terms.message}</p>}

            <Button 
              type="submit" 
              fullWidth 
              size="md" 
              loading={isLoading}
              className="shadow-lg shadow-primary/20 mt-4"
            >
              Tạo tài khoản ngay
            </Button>
          </form>

          <p className="text-center text-sm text-text-secondary font-medium">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline underline-offset-4">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
