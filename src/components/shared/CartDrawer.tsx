import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { cartApi } from '../../api/cart'
import { formatCurrency } from '../../utils/format'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { EmptyState } from './EmptyState'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

const CartQuantityInput = ({ 
  initialValue, 
  onUpdate 
}: { 
  initialValue: number, 
  onUpdate: (val: number) => void 
}) => {
  const [val, setVal] = React.useState<string | number>(initialValue)

  React.useEffect(() => {
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
      className="w-8 text-center text-xs font-bold text-text-primary border-none outline-none focus:ring-0 p-0 bg-transparent"
    />
  )
}

export const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const navigate = useNavigate()
  const { cart, setCart, count } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      if (isAuthenticated) {
        cartApi.getCart().then(res => setCart(res.data)).catch(err => console.error(err))
      }
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open, setCart, isAuthenticated])

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return
    if (!isAuthenticated) {
      useCartStore.getState().updateGuestItem(itemId, quantity)
      return
    }
    try {
      const res = await cartApi.updateItem(itemId, quantity)
      setCart(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (!isAuthenticated) {
      useCartStore.getState().removeGuestItem(itemId)
      return
    }
    try {
      const res = await cartApi.removeItem(itemId)
      setCart(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div className={cn(
        'relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col transition-transform duration-300 animate-in slide-in-from-right-full',
        'sm:rounded-l-3xl'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light text-primary rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-text-primary">Giỏ hàng</h2>
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider">{count} sản phẩm</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-bg-subtle text-text-muted transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!cart || cart.items.length === 0 ? (
            <EmptyState 
              icon={<ShoppingBag size={48} />}
              title="Giỏ hàng trống"
              description="Bạn chưa thêm sản phẩm nào vào giỏ hàng."
              action={<Button onClick={onClose}>Mua sắm ngay</Button>}
            />
          ) : (
            <div className="space-y-6">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="w-20 h-20 rounded-xl bg-bg-subtle flex-shrink-0 overflow-hidden border border-border">
                    <img src={item.product.primary_image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <Link 
                        to={`/products/${item.product.slug}`} 
                        onClick={onClose}
                        className="text-sm font-bold text-text-primary hover:text-primary transition-colors line-clamp-2 leading-tight"
                      >
                        {item.product.name}
                      </Link>
                      <button 
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-text-muted hover:text-error transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <p className="text-xs text-text-muted mt-1 uppercase font-bold tracking-tighter">/ {item.product.unit}</p>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-border rounded-lg bg-bg-subtle p-0.5">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white rounded-md text-text-muted transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <CartQuantityInput 
                          initialValue={item.quantity} 
                          onUpdate={(val) => handleUpdateQuantity(item.id, val)} 
                        />
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded-md text-text-muted transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary font-mono">{formatCurrency(item.product.current_price * item.quantity)}</p>
                        {item.price_changed && (
                          <Badge variant="warning" className="text-[10px] py-0 mt-0.5">Giá đã thay đổi</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="p-6 bg-bg-subtle/50 border-t border-border rounded-t-3xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-text-secondary font-semibold">Tạm tính:</span>
              <span className="text-2xl font-black text-primary font-mono">{formatCurrency(cart.summary.subtotal)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="secondary" 
                onClick={() => { navigate('/cart'); onClose(); }}
              >
                Xem giỏ hàng
              </Button>
              <Button 
                onClick={() => { navigate('/checkout'); onClose(); }}
                className="shadow-lg shadow-primary/30"
              >
                Thanh toán
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
            <p className="text-[10px] text-center text-text-muted mt-4 uppercase font-bold tracking-widest">
              Giao nhanh 2H tại TP. Hồ Chí Minh
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
