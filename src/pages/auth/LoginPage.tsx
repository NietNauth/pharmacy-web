import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Plus, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Zap, 
  Headphones, 
  RefreshCw 
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { cartApi } from '../../api/cart'
import { toast } from 'react-hot-toast'
import { PageWrapper } from '../../components/layout/PageWrapper'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
  remember: z.boolean().optional()
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const setAuth = useAuthStore(state => state.setAuth)
  
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const toastProcessed = React.useRef(false)

  React.useEffect(() => {
    if (toastProcessed.current) return

    const status = searchParams.get('status')
    const message = searchParams.get('message')

    if (status && message) {
      toastProcessed.current = true
      if (status === 'success') toast.success(message)
      else if (status === 'error') toast.error(message)
      else toast(message, { icon: 'ℹ️' })
      
      // Clear params from URL
      navigate('/login', { replace: true })
    }
  }, [searchParams, navigate])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true)
      const res = await authApi.login(values)
      
      // Set auth state first so that following API requests have the auth header
      setAuth(res.data.user, res.data.token)
      
      // Merge guest cart to server database if items exist
      const guestCart = useCartStore.getState().cart
      if (guestCart && guestCart.items.length > 0) {
        const itemsToMerge = guestCart.items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          prescription_id: item.prescription_id
        }))
        
        try {
          const mergeRes = await cartApi.mergeCart(itemsToMerge)
          useCartStore.getState().setCart(mergeRes.data)
        } catch (mergeErr: any) {
          console.error("Failed to merge guest cart", mergeErr)
        }
      }
      
      toast.success(`Chào mừng ${res.data.user.full_name} quay trở lại!`)
      navigate(redirect)
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left: Banner Section (Desktop) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-sky-500 to-emerald-500 p-12 items-center justify-center relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full -ml-24 -mb-24 blur-3xl" />
        
        <div className="relative z-10 max-w-lg text-white">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <img src="/logo.png" alt="PharmaVN Logo" className="w-12 h-12 object-contain bg-white rounded-2xl p-1 shadow-2xl" />
            <img src="/logo-text.png" alt="PharmaVN" className="h-10 object-contain brightness-0 invert" />
          </Link>
          
          <h1 className="text-5xl font-black mb-8 leading-tight">
            Chăm sóc sức khỏe gia đình bạn ngay hôm nay.
          </h1>
          
          <div className="space-y-6">
            {[
              { icon: <ShieldCheck />, title: 'Chất lượng hàng đầu', desc: '100% thuốc chính hãng, kiểm định nghiêm ngặt.' },
              { icon: <Zap />, title: 'Giao hàng siêu tốc', desc: 'Nhận hàng chỉ trong 2 giờ tại nội thành.' },
              { icon: <Headphones />, title: 'Dược sĩ tư vấn 24/7', desc: 'Luôn sẵn sàng giải đáp mọi thắc mắc của bạn.' },
              { icon: <RefreshCw />, title: 'Đổi trả linh hoạt', desc: 'Hỗ trợ đổi trả trong vòng 30 ngày.' }
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

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg-base lg:bg-white">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-flex lg:hidden items-center gap-2 mb-8">
              <img src="/logo.png" alt="PharmaVN Logo" className="w-10 h-10 object-contain" />
              <img src="/logo-text.png" alt="PharmaVN" className="h-8 object-contain" />
            </Link>
            <h2 className="text-3xl font-black text-text-primary mb-2">Đăng nhập</h2>
            <p className="text-sm text-text-muted font-medium">Chào mừng bạn quay trở lại với PharmaVN</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  <span className="text-sm text-text-secondary font-medium group-hover:text-primary transition-colors">Ghi nhớ đăng nhập</span>
                </label>
                <Link to="/forgot-password" virtual="true" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                  Quên mật khẩu?
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
            <Link to="/register" className="text-primary font-bold hover:underline underline-offset-4">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
