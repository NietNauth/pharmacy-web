import axios from './axios'
import { ApiResponse, Cart } from '../types'

export const cartApi = {
  getCart: () => axios.get<ApiResponse<Cart>>('/cart').then(res => res.data),
  addItem: (data: { product_id: string; quantity: number; prescription_id?: string }) => 
    axios.post<ApiResponse<Cart>>('/cart/items', data).then(res => res.data),
  mergeCart: (items: { product_id: string; quantity: number; prescription_id?: string }[]) =>
    axios.post<ApiResponse<Cart>>('/cart/merge', { items }).then(res => res.data),
  updateItem: (itemId: string, quantity: number) => 
    axios.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity }).then(res => res.data),
  removeItem: (itemId: string) => 
    axios.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`).then(res => res.data),
  clearCart: () => axios.delete<ApiResponse<any>>('/cart').then(res => res.data),
}
