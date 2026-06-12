import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Ticket, 
  Truck, 
  ShieldCheck, 
  Info,
  ChevronLeft,
  FileText,
  AlertTriangle,
  MessageCircle
} from 'lucide-react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/shared/EmptyState'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { cartApi } from '../../api/cart'
import { formatCurrency } from '../../utils/format'
import { cn } from '../../utils/cn'
import { toast } from 'react-hot-toast'
import { ConfirmModal } from '../../components/ui/ConfirmModal'

const CartQuantityInput = ({ 
  initialValue, 
  onUpdate 
}: { 
  initialValue: number, 
  onUpdate: (val: number) => void 
}) => {
  const [val, setVal] = useState<string | number>(initialValue)

  useEffect(() => {
    setVal(initialValue)
  }, [initialValue])

  const handleBlur = () => {
    const parsed = parseInt(val.toString().replace(/[^0-9]/g, ''), 10)
    if (isNaN(parsed) || parsed < 1) {
      setVal(initialValue)
    } else if (parsed !== initialValue) {
      onUpdate(parsed)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={val === 0 ? '' : val}
      onChange={(e) => {
        const inputVal = e.target.value.replace(/[^0-9]/g, '')
        setVal(inputVal === '' ? 0 : parseInt(inputVal, 10))
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="w-12 text-center font-black text-lg border-none outline-none focus:ring-0 p-0 bg-transparent"
    />
  )
}

export const CartPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { cart, setCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  
  const [shippingType, setShippingType] = useState<'standard' | 'express' | 'pickup'>('standard')
  const [itemToDelete, setItemToDelete] = useState<{ id: string, name: string } | null>(null)
  const [showClearAllModal, setShowClearAllModal] = useState(false)

  const { isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    onSuccess: (data) => setCart(data.data)
  })

  useEffect(() => {
    if (itemToDelete) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [itemToDelete])

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return
    if (!isAuthenticated) {
      useCartStore.getState().updateGuestItem(itemId, quantity)
      return
    }
    try {
      const res = await cartApi.updateItem(itemId, quantity)
      setCart(res.data)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleRemoveItem = async () => {
    if (!itemToDelete) return
    if (!isAuthenticated) {
      useCartStore.getState().removeGuestItem(itemToDelete.id)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
      setItemToDelete(null)
      return
    }
    try {
      const res = await cartApi.removeItem(itemToDelete.id)
      setCart(res.data)
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
      setItemToDelete(null)
    } catch (error: any) {
      toast.error(error.message)
    }
  }
  
  const handleClearCart = async () => {
    if (!isAuthenticated) {
      useCartStore.getState().clearCart()
      toast.success('Đã dọn sạch giỏ hàng')
      setShowClearAllModal(false)
      return
    }
    try {
      const res = await cartApi.clearCart()
      setCart(res.data)
      toast.success('Đã dọn sạch giỏ hàng')
      setShowClearAllModal(false)
    } catch (error: any) {
      toast.error(error.message)
    }
  }




  if (isLoading) return (
    <PageWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-border" />)}
        </div>
        <div className="h-64 bg-white rounded-3xl animate-pulse border border-border" />
      </div>
    </PageWrapper>
  )

  if (!cart || cart.items.length === 0) {
    return (
      <PageWrapper>
        <EmptyState 
          icon={<ShoppingBag size={48} />}
          title="Giỏ hàng trống"
          description="Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá hàng ngàn sản phẩm chăm sóc sức khỏe tại PharmaVN."
          action={<Button size="lg" onClick={() => navigate('/products')}>Tiếp tục mua sắm</Button>}
        />
      </PageWrapper>
    )
  }

  const shippingFee = 0
  const total = cart.summary.subtotal + shippingFee
  const hasPrescriptionItems = cart.items.some(item => item.product.requires_prescription && !item.prescription_id)

  return (
    <PageWrapper maxWidth="6xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
          <Link to="/products" className="p-2 bg-white border border-border rounded-xl hover:bg-bg-subtle transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-xl font-black">Giỏ hàng của bạn</h1>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-text-muted hover:text-error hover:bg-rose-50 font-black rounded-xl"
          onClick={() => setShowClearAllModal(true)}
        >
          <Trash2 size={16} className="mr-2" />
          Xóa tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map(item => (
            <div key={item.id} className="bg-white border border-border rounded-[24px] p-4 md:p-5 flex flex-col md:flex-row gap-5 hover:shadow-xl hover:shadow-sky-500/5 transition-all">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-bg-subtle flex-shrink-0 overflow-hidden border border-border group">
                <img src={item.product.primary_image} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <Link to={`/products/${item.product.slug}`} className="text-sm font-bold text-text-primary hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {item.product.name}
                    </Link>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Đơn vị: {item.product.unit}</span>
                      {item.product.requires_prescription && (
                        <Badge variant="error" className="text-[10px]">Kê đơn</Badge>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setItemToDelete({ id: item.id, name: item.product.name })}
                    className="p-2 text-text-muted hover:text-error hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center border border-border rounded-xl bg-bg-subtle p-1 w-fit">
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-white rounded-lg text-text-muted transition-colors shadow-sm"
                    >
                      <Minus size={18} />
                    </button>
                    <CartQuantityInput 
                      initialValue={item.quantity} 
                      onUpdate={(val) => handleUpdateQuantity(item.id, val)} 
                    />
                    <button 
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-white rounded-lg text-text-muted transition-colors shadow-sm"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black text-primary font-mono">{formatCurrency(item.product.current_price * item.quantity)}</span>
                      {item.price_changed && (
                        <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                          <AlertTriangle size={12} />
                          <span className="text-[10px] font-black uppercase">Giá đã thay đổi</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {item.product.requires_prescription && !item.prescription_id && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <MessageCircle size={20} className="text-amber-500" />
                      <p className="text-xs font-bold text-amber-700">Vui lòng nhắn tin với dược sĩ để mua sản phẩm này</p>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="text-xs h-8"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-live-chat'))}
                    >
                      Nhắn tin
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="bg-sky-50 border border-sky-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center">
                <Truck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-text-primary">Miễn phí vận chuyển</h4>
                <p className="text-xs text-text-muted">Cho đơn hàng từ 500.000 ₫ trở lên</p>
              </div>
            </div>
            <Link to="/products" className="text-sm font-black text-primary hover:underline">Tiếp tục mua sắm</Link>
          </div>
        </div>

        {/* Order Summary */}
        <aside className="space-y-6 sticky top-24">
          <div className="bg-white border border-border rounded-[24px] p-5 shadow-2xl shadow-sky-500/5 space-y-5">
            <h2 className="text-sm font-black text-text-primary uppercase tracking-widest">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary font-medium">Tạm tính ({cart.summary.items_count} sản phẩm)</span>
                <span className="font-bold text-text-primary">{formatCurrency(cart.summary.subtotal)}</span>
              </div>
              



              <div className="h-px bg-border my-6" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-primary">Tổng cộng</span>
                <span className="text-xl font-black text-primary font-mono">{formatCurrency(total)}</span>
              </div>

              {hasPrescriptionItems && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open-live-chat'))}>
                  <Info size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-rose-700 leading-relaxed">
                    Đơn hàng có sản phẩm kê đơn. Vui lòng nhắn tin với dược sĩ để tiến hành thanh toán.
                  </p>
                </div>
              )}

              <Button 
                fullWidth 
                size="lg" 
                className="shadow-xl shadow-primary/30"
                disabled={hasPrescriptionItems}
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.success('Vui lòng đăng nhập để tiến hành đặt hàng', { icon: '🔑' })
                    navigate('/login?redirect=/checkout')
                  } else {
                    navigate('/checkout')
                  }
                }}
              >
                Tiến hành thanh toán
                <ArrowRight size={20} className="ml-2" />
              </Button>
              
              <div className="flex items-center justify-center gap-4 py-2 opacity-50 grayscale scale-90">
                <ShieldCheck size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Thanh toán an toàn</span>
              </div>
            </div>
          </div>
          

        </aside>
      </div>

      <ConfirmModal 
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleRemoveItem}
        title="Xác nhận xóa?"
        description={
          <>Bạn có chắc chắn muốn xóa <span className="font-bold text-text-primary">"{itemToDelete?.name}"</span> khỏi giỏ hàng không?</>
        }
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        variant="danger"
        icon={<Trash2 size={32} strokeWidth={2.5} />}
      />

      <ConfirmModal 
        isOpen={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        onConfirm={handleClearCart}
        title="Dọn sạch giỏ hàng?"
        description="Bạn có chắc chắn muốn xóa toàn bộ sản phẩm khỏi giỏ hàng không? Hành động này không thể hoàn tác."
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        variant="danger"
        icon={<Trash2 size={32} strokeWidth={2.5} />}
      />
    </PageWrapper>
  )
}
