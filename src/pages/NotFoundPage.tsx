import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, Home, Search } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { PageWrapper } from '../components/layout/PageWrapper'

export const NotFoundPage = () => {
  const navigate = useNavigate()

  return (
    <PageWrapper className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="relative mb-8">
        <h1 className="text-[180px] font-black leading-none bg-gradient-to-br from-primary to-emerald-500 bg-clip-text text-transparent opacity-20">
          404
        </h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 bg-primary rounded-full blur-[80px] opacity-20 animate-pulse" />
          <ShoppingBag size={120} className="text-primary drop-shadow-2xl animate-bounce" />
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <h2 className="text-4xl font-black text-text-primary tracking-tight">Trang không tồn tại</h2>
        <p className="text-lg text-text-secondary font-medium max-w-md mx-auto leading-relaxed">
          Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển sang một địa chỉ khác.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-12">
        <Button size="lg" className="px-10 shadow-xl shadow-primary/20" onClick={() => navigate('/')}>
          <Home size={20} className="mr-2" />
          Về trang chủ
        </Button>
        <Button variant="secondary" size="lg" className="px-10" onClick={() => navigate('/products')}>
          <Search size={20} className="mr-2" />
          Tìm thuốc ngay
        </Button>
      </div>
    </PageWrapper>
  )
}
