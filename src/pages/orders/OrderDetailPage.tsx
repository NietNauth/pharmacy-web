import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ChevronLeft, 
  Package, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Truck, 
  RotateCcw,
  AlertCircle,
  FileText,
  Calendar,
  Phone,
  User,
  ShoppingBag,
  ShieldCheck,
  XCircle,
  Trash2
} from 'lucide-react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { orderApi } from '../../api/orders'
import { useAuthStore } from '../../stores/authStore'
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusColor, getOrderStatusBg, getPaymentMethodLabel } from '../../utils/format'
import { cn } from '../../utils/cn'
import { toast } from 'react-hot-toast'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { useState } from 'react'

export const OrderDetailPage = () => {
  const { code } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showCancelModal, setShowCancelModal] = useState(false)

  const { data: orderRes, isLoading } = useQuery({
    queryKey: ['order', code],
    queryFn: () => orderApi.getByCode(code!),
    enabled: !!code
  })

  const cancelMutation = useMutation({
    mutationFn: () => orderApi.cancel(orderRes!.data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', code] })
      toast.success('Hủy đơn hàng thành công')
      setShowCancelModal(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
      setShowCancelModal(false)
    }
  })

  const retryPaymentMutation = useMutation({
    mutationFn: () => orderApi.retryPayment(orderRes!.data.id, orderRes!.data.payment.method),
    onSuccess: (data) => {
      if (data.data?.payment_url) {
        window.location.href = data.data.payment_url
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  if (isLoading) return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="h-12 bg-white rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-white rounded-3xl animate-pulse" />
          <div className="h-96 bg-white rounded-3xl animate-pulse" />
        </div>
      </div>
    </PageWrapper>
  )

  if (!orderRes) return null
  const order = orderRes.data

  const getCustomOrderStatusLabel = (status: string, deliveryType: string) => {
    if (deliveryType === 'pickup') {
      if (status === 'processing') return 'Đang đóng gói'
      if (status === 'shipped') return 'Sẵn sàng tại chi nhánh'
      if (status === 'delivered') return 'Đã nhận hàng'
    }
    return getOrderStatusLabel(status as any)
  }

  const steps = order.delivery_type === 'pickup'
    ? [
        { id: 'pending', label: 'Đặt hàng', icon: <ShoppingBag size={20} /> },
        { id: 'confirmed', label: 'Xác nhận', icon: <CheckCircle2 size={20} /> },
        { id: 'processing', label: 'Đóng gói', icon: <Package size={20} /> },
        { id: 'shipped', label: 'Sẵn sàng tại chi nhánh', icon: <MapPin size={20} /> },
        { id: 'delivered', label: 'Đã nhận hàng', icon: <CheckCircle2 size={20} /> }
      ]
    : [
        { id: 'pending', label: 'Đặt hàng', icon: <ShoppingBag size={20} /> },
        { id: 'confirmed', label: 'Xác nhận', icon: <CheckCircle2 size={20} /> },
        { id: 'processing', label: 'Xử lý', icon: <RotateCcw size={20} /> },
        { id: 'shipped', label: 'Đang giao', icon: <Truck size={20} /> },
        { id: 'delivered', label: 'Hoàn tất', icon: <Package size={20} /> }
      ]

  const currentStepIndex = steps.findIndex(s => s.id === order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <PageWrapper maxWidth="lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/orders')}
            className="p-2 bg-white border border-border rounded-xl hover:bg-bg-subtle transition-colors shadow-sm"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-text-primary tracking-tighter">Đơn hàng #{order.order_code}</h1>
              <Badge className={cn('font-black uppercase tracking-widest text-[10px]', getOrderStatusColor(order.status), getOrderStatusBg(order.status))}>
                {getCustomOrderStatusLabel(order.status, order.delivery_type)}
              </Badge>
            </div>
            <p className="text-xs text-text-muted font-bold uppercase tracking-tight mt-1 flex items-center gap-2">
              <Calendar size={12} />
              Đặt lúc: {formatDateTime(order.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">

          {(order.status === 'pending' || order.status === 'confirmed') && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-error hover:bg-rose-50 font-bold"
              onClick={() => setShowCancelModal(true)}
              loading={cancelMutation.isPending}
            >
              Hủy đơn hàng
            </Button>
          )}
        </div>
      </div>

      {/* Progress Stepper */}
      {!isCancelled && (
        <Card className="p-10 mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] relative">
            {/* Background Line */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-bg-subtle rounded-full -z-1" />
            <div 
              className="absolute top-6 left-6 h-1 bg-emerald-500 rounded-full transition-all duration-1000 -z-1" 
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step, index) => {
              const isActive = index <= currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.id} className="flex flex-col items-center gap-5 relative z-10">
                  <div className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center border-4 transition-all duration-500',
                    isActive 
                      ? 'bg-emerald-500 border-white text-white shadow-xl shadow-emerald-500/30' 
                      : 'bg-white border-bg-subtle text-text-muted',
                    isCurrent && 'scale-125 ring-8 ring-emerald-500/10'
                  )}>
                    {isActive && !isCurrent ? <CheckCircle2 size={24} /> : step.icon}
                  </div>
                  <span className={cn(
                    'text-[10px] font-black uppercase tracking-widest',
                    isActive ? 'text-emerald-600' : 'text-text-muted'
                  )}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {isCancelled && (
        <div className="bg-rose-50 border border-rose-200 rounded-[32px] p-8 mb-8 flex items-center gap-6 animate-in zoom-in-95 duration-500">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center flex-shrink-0">
            <XCircle size={40} />
          </div>
          <div>
            <h3 className="text-xl font-black text-rose-800">Đơn hàng đã bị hủy</h3>
            <p className="text-sm text-rose-600 font-medium">Đơn hàng đã được hủy thành công. Vui lòng liên hệ hỗ trợ nếu đây là một sự nhầm lẫn.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Shipping & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Info */}
          <Card className="p-8">
            <h3 className="text-lg font-black text-text-primary mb-6 flex items-center gap-3">
              <Truck size={22} className="text-primary" />
              Thông tin nhận hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-bg-subtle rounded-xl flex items-center justify-center flex-shrink-0">
                    <User size={20} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Người nhận</p>
                    <p className="text-sm font-bold text-text-primary">{order.recipient_name || order.user?.name || user?.name || 'Khách hàng'}</p>
                    <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                      <Phone size={12} /> {order.recipient_phone || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-bg-subtle rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-text-muted" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
                      {order.delivery_type === 'pickup' ? 'Chi nhánh nhận hàng' : 'Địa chỉ giao hàng'}
                    </p>
                    {order.delivery_type === 'pickup' ? (
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-text-primary">{order.branch.name}</p>
                        <p className="text-xs text-text-secondary leading-relaxed">{order.branch.address}</p>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-text-primary leading-relaxed">{order.delivery_address || 'Đang cập nhật'}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-bg-subtle/50 rounded-2xl border border-border border-dashed">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Ghi chú đơn hàng</p>
                  <p className="text-xs text-text-secondary italic">"{order.note || 'Không có ghi chú'}"</p>
                </div>
                <div className="flex gap-4 items-center p-4 bg-primary-light/30 rounded-2xl border border-primary-light">
                  <div className="p-2 bg-primary text-white rounded-lg">
                    <Truck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-primary uppercase tracking-tight">Hình thức vận chuyển</p>
                    <p className="text-sm font-bold text-text-primary mt-0.5">
                      {order.delivery_type === 'pickup' ? 'Nhận tại quầy' : order.delivery_type === 'express' ? 'Giao hỏa tốc 2H' : 'Giao hàng tiêu chuẩn'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Items List */}
          <Card className="p-0 overflow-hidden">
            <div className="p-8 border-b border-border">
              <h3 className="text-lg font-black text-text-primary flex items-center gap-3">
                <FileText size={22} className="text-primary" />
                Danh sách sản phẩm
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-bg-subtle/30 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border">
                  <tr>
                    <th className="px-8 py-4">Sản phẩm</th>
                    <th className="px-8 py-4 text-center">Số lượng</th>
                    <th className="px-8 py-4 text-right">Đơn giá</th>
                    <th className="px-8 py-4 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map(item => (
                    <tr key={item.id} className="hover:bg-bg-subtle/50 transition-colors">
                      <td className="px-8 py-5">
                        <Link to={`/products/${item.product.slug}`} className="flex items-center gap-4 group">
                          <div className="w-16 h-16 rounded-xl bg-bg-subtle border border-border flex-shrink-0 overflow-hidden">
                            <img src={item.product.primary_image} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <p className="font-bold text-text-primary group-hover:text-primary transition-colors leading-tight line-clamp-2">
                            {item.product.name}
                          </p>
                        </Link>
                      </td>
                      <td className="px-8 py-5 text-center font-bold text-text-secondary">{item.quantity}</td>
                      <td className="px-8 py-5 text-right font-mono text-text-muted">{formatCurrency(item.unit_price)}</td>
                      <td className="px-8 py-5 text-right font-black text-text-primary font-mono">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-bg-subtle/30 border-t border-border">
                  <tr>
                    <td colSpan={3} className="px-8 py-4 text-right font-bold text-text-secondary">Tạm tính:</td>
                    <td className="px-8 py-4 text-right font-black text-text-primary font-mono">{formatCurrency(order.subtotal)}</td>
                  </tr>
                  {order.discount_amount > 0 && (
                    <tr>
                      <td colSpan={3} className="px-8 py-4 text-right font-bold text-rose-500">Giảm giá:</td>
                      <td className="px-8 py-4 text-right font-black text-rose-500 font-mono">-{formatCurrency(order.discount_amount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="px-8 py-4 text-right font-bold text-text-secondary">Phí vận chuyển:</td>
                    <td className="px-8 py-4 text-right font-black text-text-primary font-mono">{formatCurrency(order.shipping_fee)}</td>
                  </tr>
                  <tr className="border-t-2 border-primary/20 bg-primary-light/10">
                    <td colSpan={3} className="px-8 py-6 text-right text-lg font-black text-text-primary">Tổng cộng:</td>
                    <td className="px-8 py-6 text-right text-2xl font-black text-primary font-mono">{formatCurrency(order.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* Right: Payment Sidebar */}
        <aside className="space-y-6">
          <Card className="p-8 shadow-2xl shadow-sky-500/5">
            <h3 className="text-lg font-black text-text-primary mb-8 flex items-center gap-3">
              <CreditCard size={22} className="text-primary" />
              Thanh toán
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Phương thức thanh toán</p>
                <div className="flex items-center gap-3 p-4 bg-bg-subtle rounded-2xl border border-border">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-border shadow-sm">
                    <CreditCard size={20} className="text-primary" />
                  </div>
                  <span className="text-sm font-bold text-text-primary">{getPaymentMethodLabel(order.payment.method)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Trạng thái thanh toán</p>
                <div className={cn(
                  'flex items-center gap-3 p-4 rounded-2xl border',
                  order.payment.status === 'paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                )}>
                  {order.payment.status === 'paid' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <span className="text-sm font-black uppercase tracking-tight">
                    {order.payment.status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                  </span>
                </div>
              </div>

              {order.payment.status !== 'paid' && order.status !== 'cancelled' && ['vnpay', 'momo'].includes(order.payment.method) && (
                <div className="pt-2">
                  {new Date().getTime() - new Date(order.created_at).getTime() < 2 * 60 * 60 * 1000 ? (
                    <Button 
                      fullWidth
                      onClick={() => retryPaymentMutation.mutate()}
                      loading={retryPaymentMutation.isPending}
                    >
                      Thanh toán lại ngay
                    </Button>
                  ) : (
                    <div className="text-center p-3 bg-rose-50 rounded-xl border border-rose-100">
                      <p className="text-xs text-rose-600 font-bold">Đã quá hạn thanh toán (2h).</p>
                      <p className="text-[10px] text-rose-500 mt-1">Vui lòng đặt đơn hàng mới.</p>
                    </div>
                  )}
                </div>
              )}

              {order.payment.transaction_id && (
                <div className="space-y-1 p-4 bg-bg-subtle rounded-2xl border border-border border-dashed">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Mã giao dịch</p>
                  <p className="text-xs font-mono text-text-secondary">{order.payment.transaction_id}</p>
                  <p className="text-[10px] text-text-muted mt-2">Ngày thanh toán: {formatDateTime(order.payment.paid_at!)}</p>
                </div>
              )}

              <div className="h-px bg-border my-6" />

              <div className="bg-sky-50 rounded-2xl p-4 flex gap-3 items-start">
                <ShieldCheck size={18} className="text-primary mt-0.5 flex-shrink-0" />
                <p className="text-[10px] text-sky-800 font-medium leading-relaxed">
                  Giao dịch của bạn được bảo mật tuyệt đối bởi hệ thống mã hóa chuẩn y tế của PharmaVN.
                </p>
              </div>
            </div>
          </Card>

          <Button 
            variant="secondary" 
            fullWidth 
            size="lg" 
            onClick={() => navigate('/products')}
          >
            Mua sắm thêm
          </Button>
        </aside>
      </div>

      <ConfirmModal 
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => cancelMutation.mutate()}
        title="Xác nhận hủy?"
        description={
          <>Bạn có chắc chắn muốn hủy đơn hàng <span className="font-bold text-text-primary">#{order.order_code}</span> không? Hành động này không thể hoàn tác.</>
        }
        confirmText="Xác nhận hủy"
        cancelText="Hủy"
        variant="danger"
        loading={cancelMutation.isPending}
        icon={<Trash2 size={32} strokeWidth={2.5} />}
      />
    </PageWrapper>
  )
}
