import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Package, 
  ChevronRight, 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  RotateCcw,
  ShoppingBag,
  Calendar
} from 'lucide-react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/shared/EmptyState'
import { orderApi } from '../../api/orders'
import { OrderStatus } from '../../types'
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor, getOrderStatusBg } from '../../utils/format'
import { cn } from '../../utils/cn'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { Trash2 } from 'lucide-react'

export const OrdersPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeStatus, setActiveStatus] = useState<OrderStatus | 'all'>('all')
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)

  const getCustomOrderStatusLabel = (status: string, deliveryType: string) => {
    if (deliveryType === 'pickup') {
      if (status === 'processing') return 'Đang đóng gói'
      if (status === 'shipped') return 'Sẵn sàng tại chi nhánh'
      if (status === 'delivered') return 'Đã nhận hàng'
    }
    return getOrderStatusLabel(status as any)
  }

  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => orderApi.cancel(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Hủy đơn hàng thành công')
      setCancellingOrderId(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng')
      setCancellingOrderId(null)
    }
  })

  const retryPaymentMutation = useMutation({
    mutationFn: ({ id, method }: { id: string, method: string }) => orderApi.retryPayment(id, method),
    onSuccess: (data) => {
      if (data.data?.payment_url) {
        window.location.href = data.data.payment_url
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    }
  })

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', activeStatus],
    queryFn: () => orderApi.getList({ 
      status: activeStatus === 'all' ? undefined : activeStatus,
      per_page: 10 
    })
  })

  const tabs: { id: OrderStatus | 'all'; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'Tất cả', icon: <Package size={16} /> },
    { id: 'pending', label: 'Chờ xác nhận', icon: <Clock size={16} /> },
    { id: 'confirmed', label: 'Đã xác nhận', icon: <CheckCircle2 size={16} /> },
    { id: 'processing', label: 'Đang xử lý', icon: <RotateCcw size={16} /> },
    { id: 'shipped', label: 'Đang giao', icon: <Truck size={16} /> },
    { id: 'delivered', label: 'Đã nhận', icon: <CheckCircle2 size={16} /> },
    { id: 'cancelled', label: 'Đã hủy', icon: <XCircle size={16} /> }
  ]

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Đơn hàng của tôi</h1>
          <p className="text-sm text-text-muted font-medium">Theo dõi lịch sử mua hàng và tiến độ đơn hàng của bạn</p>
        </div>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo mã đơn hàng..." 
            className="bg-white border border-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-4 focus:ring-primary-light focus:border-primary transition-all w-full md:w-64"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveStatus(tab.id)}
            className={cn(
              'flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap',
              activeStatus === tab.id 
                ? 'border-primary text-primary bg-primary-light/10' 
                : 'border-transparent text-text-muted hover:text-text-primary hover:bg-bg-subtle'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-white border border-border rounded-[32px] animate-pulse" />
          ))
        ) : !ordersData || ordersData.data.length === 0 ? (
          <EmptyState 
            icon={<ShoppingBag size={48} />}
            title="Chưa có đơn hàng nào"
            description={`Bạn không có đơn hàng nào trong trạng thái "${tabs.find(t => t.id === activeStatus)?.label}".`}
            action={<Button size="lg" onClick={() => navigate('/products')}>Khám phá sản phẩm</Button>}
            className="bg-white rounded-[32px] border border-border shadow-sm"
          />
        ) : (
          ordersData.data.map(order => (
            <div 
              key={order.id} 
              className="group bg-white border border-border rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all duration-300"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4 bg-bg-subtle/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-border shadow-sm">
                    <Package className="text-primary" size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-text-primary font-mono tracking-tighter">#{order.order_code}</span>
                      <Badge className={cn('font-black uppercase tracking-widest text-[10px]', getOrderStatusColor(order.status), getOrderStatusBg(order.status))}>
                        {getCustomOrderStatusLabel(order.status, order.delivery_type)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-muted font-bold mt-1 uppercase tracking-tight">
                      <Calendar size={12} />
                      Ngày đặt: {formatDate(order.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tổng tiền</p>
                    <p className="text-xl font-black text-primary font-mono">{formatCurrency(order.total)}</p>
                  </div>
                  <ChevronRight className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" size={24} />
                </div>
              </div>

              {/* Card Body - Products Preview */}
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex-1 flex gap-4 overflow-x-auto pb-2">
                  {/* Real implementation would show first few items from the order */}
                  <div className="flex gap-3">
                    {order.items?.slice(0, 3).map((item, i) => (
                      <div key={item.id} className="w-16 h-16 rounded-xl bg-bg-subtle border border-border flex-shrink-0 overflow-hidden">
                        <img 
                          src={item.product.primary_image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="w-16 h-16 rounded-xl bg-bg-subtle border border-border flex items-center justify-center text-text-muted font-black text-xs">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-sm font-bold text-text-primary truncate">
                      {order.items_count} sản phẩm • {order.delivery_type === 'pickup' ? 'Nhận tại quầy' : 'Giao tận nơi'}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Thanh toán: <span className="font-bold text-text-secondary">{order.payment.method.toUpperCase()}</span> • 
                      Trạng thái: <span className={cn('font-black uppercase', order.payment.status === 'paid' ? 'text-emerald-600' : 'text-amber-600')}>
                        {order.payment.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={() => navigate(`/orders/${order.order_code}`)}
                  >
                    Xem chi tiết
                  </Button>
                  {order.payment.status !== 'paid' && order.status !== 'cancelled' && ['vnpay', 'momo'].includes(order.payment.method) && (
                    new Date().getTime() - new Date(order.created_at).getTime() < 2 * 60 * 60 * 1000 ? (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          retryPaymentMutation.mutate({ id: order.id.toString(), method: order.payment.method })
                        }}
                        loading={retryPaymentMutation.isPending}
                      >
                        Thanh toán lại
                      </Button>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-700 border-rose-200 font-bold uppercase text-[10px]">Đã hết hạn TT</Badge>
                    )
                  )}
                  {order.status === 'pending' && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-error hover:bg-rose-50 font-bold"
                      onClick={(e) => {
                        e.stopPropagation()
                        setCancellingOrderId(order.id)
                      }}
                    >
                      Hủy đơn
                    </Button>
                  )}
                  {order.status === 'delivered' && (
                    <Button variant="primary" size="sm" className="shadow-lg shadow-primary/20">Đánh giá</Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal 
        isOpen={cancellingOrderId !== null}
        onClose={() => setCancellingOrderId(null)}
        onConfirm={() => cancellingOrderId && cancelMutation.mutate(cancellingOrderId)}
        title="Xác nhận hủy?"
        description={
          <>Bạn có chắc chắn muốn hủy đơn hàng <span className="font-bold text-text-primary">#{ordersData?.data.find(o => o.id === cancellingOrderId)?.order_code}</span> không? Hành động này không thể hoàn tác.</>
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
