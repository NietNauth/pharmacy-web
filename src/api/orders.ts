import axios from './axios'
import { ApiResponse, Order, OrderDetail, PaginatedResponse } from '../types'

export const orderApi = {
  placeOrder: (data: any) => axios.post<ApiResponse<Order>>('/orders', data).then(res => res.data),
  getList: (params: any) => axios.get<PaginatedResponse<Order>>('/orders', { params }).then(res => res.data),
  getByCode: (orderCode: string) => axios.get<ApiResponse<OrderDetail>>(`/orders/${orderCode}`).then(res => res.data),
  cancel: (id: string) => axios.post<ApiResponse<any>>(`/orders/${id}/cancel`).then(res => res.data),
  retryPayment: (id: string, paymentMethod: string) => axios.post<ApiResponse<{ payment_url: string }>>(`/orders/${id}/retry-payment`, { payment_method: paymentMethod }).then(res => res.data),
  vnpayReturn: (params: any) => axios.get<ApiResponse<any>>('/vnpay-return', { params }).then(res => res.data),
  momoReturn: (params: any) => axios.get<ApiResponse<any>>('/momo-return', { params }).then(res => res.data),
}
