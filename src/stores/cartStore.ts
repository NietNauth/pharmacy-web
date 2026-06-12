import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Cart, Product } from '../types'

interface CartState {
  cart: Cart | null
  count: number
  setCart: (cart: Cart) => void
  clearCart: () => void
  
  // Guest cart helper actions
  addGuestItem: (product: Product, quantity: number) => void
  updateGuestItem: (itemId: string, quantity: number) => void
  removeGuestItem: (itemId: string) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      count: 0,
      setCart: (cart) => set({ 
        cart, 
        count: cart ? cart.summary.items_count : 0 
      }),
      clearCart: () => set({ cart: null, count: 0 }),
      
      addGuestItem: (product, quantity) => {
        const currentCart = get().cart || {
          id: 'guest_cart',
          updated_at: new Date().toISOString(),
          items: [],
          summary: { items_count: 0, subtotal: 0 }
        }
        
        const existingItemIdx = currentCart.items.findIndex(
          (item) => item.product.id === product.id
        )
        
        let newItems = [...currentCart.items]
        
        if (existingItemIdx > -1) {
          const existingItem = newItems[existingItemIdx]
          newItems[existingItemIdx] = {
            ...existingItem,
            quantity: existingItem.quantity + quantity
          }
        } else {
          newItems.push({
            id: 'guest_' + product.id,
            product: {
              id: product.id,
              name: product.name,
              slug: product.slug,
              current_price: product.current_price,
              primary_image: product.primary_image,
              requires_prescription: product.requires_prescription,
              status: product.status
            },
            quantity: quantity,
            price_snapshot: product.current_price,
            price_changed: false
          })
        }
        
        const itemsCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
        const subtotal = newItems.reduce((sum, item) => sum + (item.quantity * item.product.current_price), 0)
        
        const updatedCart: Cart = {
          id: 'guest_cart',
          updated_at: new Date().toISOString(),
          items: newItems,
          summary: {
            items_count: itemsCount,
            subtotal: subtotal
          }
        }
        
        set({ cart: updatedCart, count: itemsCount })
      },
      
      updateGuestItem: (itemId, quantity) => {
        const currentCart = get().cart
        if (!currentCart) return
        
        let newItems = currentCart.items.map(item => {
          if (item.id === itemId) {
            return { ...item, quantity }
          }
          return item
        }).filter(item => item.quantity > 0)
        
        const itemsCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
        const subtotal = newItems.reduce((sum, item) => sum + (item.quantity * item.product.current_price), 0)
        
        const updatedCart: Cart = {
          id: 'guest_cart',
          updated_at: new Date().toISOString(),
          items: newItems,
          summary: {
            items_count: itemsCount,
            subtotal: subtotal
          }
        }
        
        set({ cart: updatedCart, count: itemsCount })
      },
      
      removeGuestItem: (itemId) => {
        const currentCart = get().cart
        if (!currentCart) return
        
        let newItems = currentCart.items.filter(item => item.id !== itemId)
        
        const itemsCount = newItems.reduce((sum, item) => sum + item.quantity, 0)
        const subtotal = newItems.reduce((sum, item) => sum + (item.quantity * item.product.current_price), 0)
        
        const updatedCart: Cart = {
          id: 'guest_cart',
          updated_at: new Date().toISOString(),
          items: newItems,
          summary: {
            items_count: itemsCount,
            subtotal: subtotal
          }
        }
        
        set({ cart: updatedCart, count: itemsCount })
      }
    }),
    {
      name: 'pharma_cart',
    }
  )
)
