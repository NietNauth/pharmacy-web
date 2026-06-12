import { useState, useEffect } from 'react'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from '../stores/authStore'
import { cartApi } from '../api/cart'
import { toast } from 'react-hot-toast'
import { Product } from '../types'

// Global state for drawer to be accessible anywhere
let isDrawerOpenGlobal = false
const drawerListeners = new Set<(open: boolean) => void>()

const setDrawerOpenGlobal = (open: boolean) => {
  isDrawerOpenGlobal = open
  drawerListeners.forEach(listener => listener(open))
}

export const useCart = () => {
  const { cart, count, setCart, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(isDrawerOpenGlobal)

  useEffect(() => {
    const listener = (open: boolean) => setIsDrawerOpen(open)
    drawerListeners.add(listener)
    return () => { drawerListeners.delete(listener) }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart()
    } else {
      // Keep guest cart in localStorage, don't clear it!
    }
  }, [isAuthenticated])

  const fetchCart = async () => {
    try {
      setIsLoading(true)
      const res = await cartApi.getCart()
      setCart(res.data)
    } catch (error) {
      console.error('Failed to fetch cart', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (productId: string, quantity = 1, product?: Product) => {
    if (!isAuthenticated) {
      if (product) {
        useCartStore.getState().addGuestItem(product, quantity)
        setDrawerOpenGlobal(true)
        toast.success(`Đã thêm ${quantity} vào giỏ hàng tạm`, {
          style: { borderRadius: '16px', background: '#334155', color: '#fff' }
        })
      } else {
        toast.error('Không tìm thấy thông tin sản phẩm')
      }
      return
    }

    try {
      setIsLoading(true)
      const res = await cartApi.addItem({ product_id: productId, quantity })
      setCart(res.data)
      setDrawerOpenGlobal(true)
      return res.data
    } catch (error: any) {
      toast.error(error.message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    cart,
    count,
    isLoading,
    addItem,
    fetchCart,
    isDrawerOpen,
    openDrawer: () => setDrawerOpenGlobal(true),
    closeDrawer: () => setDrawerOpenGlobal(false)
  }
}
