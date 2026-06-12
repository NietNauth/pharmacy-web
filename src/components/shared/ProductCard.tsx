import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Product } from '../../types'
import { formatCurrency, getDiscountPercent } from '../../utils/format'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { cartApi } from '../../api/cart'
import { toast } from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  variant?: 'grid' | 'list' | 'carousel'
  className?: string
}

export const ProductCard = ({ product, variant = 'grid', className }: ProductCardProps) => {
  const { setCart, addGuestItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [isAdding, setIsAdding] = React.useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (product.requires_prescription) {
      toast.error('Sản phẩm này cần đơn thuốc. Vui lòng nhắn tin với dược sĩ.', {
        icon: '💬',
        duration: 4000
      })
      return
    }

    if (!isAuthenticated) {
      addGuestItem(product, 1)
      toast.success(`Đã thêm ${product.name} vào giỏ hàng tạm`, {
        style: { borderRadius: '16px', background: '#334155', color: '#fff' }
      })
      return
    }

    try {
      setIsAdding(true)
      const res = await cartApi.addItem({ product_id: product.id, quantity: 1 })
      setCart(res.data)
      toast.success(`Đã thêm ${product.name} vào giỏ hàng`, {
        style: { borderRadius: '16px', background: '#334155', color: '#fff' }
      })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsAdding(false)
    }
  }

  const discount = getDiscountPercent(product.base_price, product.sale_price || product.current_price)

  if (variant === 'list') {
    return (
      <Link 
        to={`/products/${product.slug}`}
        className={cn(
          'flex gap-6 p-4 bg-white border border-border rounded-2xl hover:shadow-xl hover:shadow-sky-500/5 transition-all group',
          className
        )}
      >
        <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-bg-subtle">
          <img 
            src={product.primary_image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.requires_prescription && (
            <Badge variant="error" className="absolute top-2 left-2">Kê đơn</Badge>
          )}
          {product.status === 'out_of_stock' && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-gray-800 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">Hết hàng</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col py-1">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-xs text-text-muted font-medium mb-1">{product.brand?.name || 'Chính hãng'}</p>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
                {product.name}
              </h3>
            </div>
            {discount > 0 && (
              <Badge variant="warning">-{discount}%</Badge>
            )}
          </div>


          <div className="mt-auto flex items-end justify-between">
            <div className="space-y-1">
              {product.sale_price && (
                <p className="text-sm text-text-muted line-through">{formatCurrency(product.base_price)}</p>
              )}
              <p className="text-xl font-black text-primary font-mono">{formatCurrency(product.current_price)}</p>
            </div>
            <Button 
              size="sm" 
              onClick={handleAddToCart}
              loading={isAdding}
              disabled={product.status === 'out_of_stock'}
            >
              <ShoppingCart size={18} className="mr-2" />
              Thêm vào giỏ
            </Button>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link 
      to={`/products/${product.slug}`}
      className={cn(
        'flex flex-col bg-white border border-border rounded-2xl p-2.5 hover:shadow-xl hover:shadow-sky-500/10 hover:-translate-y-1 transition-all group relative',
        className
      )}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-bg-subtle mb-3">
        <img 
          src={product.primary_image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.requires_prescription && (
            <Badge variant="error" className="shadow-sm">Kê đơn</Badge>
          )}
        </div>
        
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-sm">
            -{discount}%
          </div>
        )}

        {/* Out of stock overlay */}
        {product.status === 'out_of_stock' && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">Hết hàng</span>
          </div>
        )}

        {/* Hover Action Button */}
        <div className="absolute inset-x-2 bottom-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
          <Button 
            fullWidth 
            size="sm" 
            onClick={handleAddToCart}
            loading={isAdding}
            disabled={product.status === 'out_of_stock'}
            className="shadow-lg shadow-primary/30"
          >
            <ShoppingCart size={18} className="mr-2" />
            Thêm giỏ hàng
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-0.5">{product.brand?.name || 'PharmaVN'}</p>
        <h3 className="text-[13px] font-bold text-text-primary leading-[1.4] line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[38px]">
          {product.name}
        </h3>
        

        <div className="mt-auto h-11 flex flex-col justify-end">
          {product.sale_price && (
            <span className="text-[11px] text-text-muted line-through font-medium leading-none mb-1">
              {formatCurrency(product.base_price)}
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-primary font-mono leading-none">
              {formatCurrency(product.current_price)}
            </span>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
              / {product.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile only add button */}
      <button 
        onClick={handleAddToCart}
        className="md:hidden absolute bottom-3 right-3 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-transform"
        disabled={product.status === 'out_of_stock'}
      >
        <Plus size={24} />
      </button>
    </Link>
  )
}
