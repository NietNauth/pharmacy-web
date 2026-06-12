import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { orderApi } from '../../api/orders'
import { formatCurrency } from '../../utils/format'
import { cn } from '../../utils/cn'

export const VNPayReturnPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleReturn = async () => {
      try {
        const params = Object.fromEntries(searchParams.entries())
        const response = await orderApi.vnpayReturn(params)
        setResult(response)
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra khi xử lý thanh toán')
      } finally {
        setLoading(false)
      }
    }

    handleReturn()
  }, [searchParams])

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-lg font-black text-text-primary">Đang xử lý kết quả thanh toán...</p>
        </div>
      </PageWrapper>
    )
  }

  const isSuccess = !!result?.success && !error

  return (
    <PageWrapper maxWidth="lg">
      <div className="py-12 animate-in fade-in zoom-in-95 duration-700">
        <Card className="p-8 text-center space-y-6 overflow-hidden relative">
          <div className={cn(
            "absolute top-0 left-0 w-full h-2",
            isSuccess ? "bg-emerald-500" : "bg-rose-500"
          )} />

          <div className="relative inline-block">
            <div className={cn(
              "absolute inset-0 rounded-full blur-2xl opacity-10 animate-pulse",
              isSuccess ? "bg-emerald-500" : "bg-rose-500"
            )} />
            <div className={cn(
              "relative w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-xl",
              isSuccess ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-rose-500 text-white shadow-rose-500/20"
            )}>
              {isSuccess ? <CheckCircle2 size={40} strokeWidth={2.5} /> : <XCircle size={40} strokeWidth={2.5} />}
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-text-primary tracking-tight">
              {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
            </h1>
            <p className="text-sm text-text-secondary font-medium px-4">
              {isSuccess 
                ? 'Cảm ơn bạn đã tin tưởng PharmaVN. Đơn hàng của bạn đã được thanh toán thành công.'
                : error || result?.message || 'Rất tiếc, đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.'}
            </p>
          </div>

          {result?.data && (
            <div className="max-w-sm mx-auto bg-bg-base/50 border border-border rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Mã đơn hàng</span>
                <span className="text-sm font-black text-primary font-mono bg-primary/5 px-3 py-1 rounded-lg">
                  #{result.data.order_code}
                </span>
              </div>
              <div className="h-px bg-border/50" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tổng thanh toán</span>
                <span className="text-lg font-black text-text-primary font-mono">
                  {formatCurrency(result.data.total)}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {isSuccess ? (
              <>
                <Button size="md" className="px-8 h-12 rounded-xl shadow-lg shadow-primary/10" onClick={() => navigate(`/orders/${result?.data?.order_code}`)}>
                  Xem đơn hàng
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button variant="secondary" size="md" className="px-8 h-12 rounded-xl" onClick={() => navigate('/')}>
                  Tiếp tục mua sắm
                </Button>
              </>
            ) : (
              <>
                <Button size="md" className="px-8 h-12 rounded-xl shadow-lg shadow-primary/10" onClick={() => navigate('/checkout')}>
                  Thử lại
                  <ArrowRight size={18} className="ml-2" />
                </Button>
                <Button variant="secondary" size="md" className="px-8 h-12 rounded-xl" onClick={() => navigate('/cart')}>
                  Quay lại giỏ hàng
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
