import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { OrderStatus, PaymentMethod, PrescriptionStatus } from '../types'

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy')
}

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'dd/MM/yyyy HH:mm')
}

export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: vi })
}

export const getDiscountPercent = (base: number, sale: number): number => {
  if (!base || !sale || sale >= base) return 0
  return Math.round(((base - sale) / base) * 100)
}

export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
  }
  return labels[status] || status
}

export const getOrderStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    pending: 'text-amber-600',
    confirmed: 'text-blue-600',
    processing: 'text-sky-600',
    shipped: 'text-indigo-600',
    delivered: 'text-emerald-600',
    cancelled: 'text-rose-600',
    refunded: 'text-gray-600',
  }
  return colors[status] || 'text-gray-600'
}

export const getOrderStatusBg = (status: OrderStatus): string => {
  const bgs: Record<OrderStatus, string> = {
    pending: 'bg-amber-50',
    confirmed: 'bg-blue-50',
    processing: 'bg-sky-50',
    shipped: 'bg-indigo-50',
    delivered: 'bg-emerald-50',
    cancelled: 'bg-rose-50',
    refunded: 'bg-gray-50',
  }
  return bgs[status] || 'bg-gray-50'
}

export const getPrescriptionStatusLabel = (status: PrescriptionStatus): string => {
  const labels: Record<PrescriptionStatus, string> = {
    pending: 'Chờ duyệt',
    approved: 'Đã chấp nhận',
    rejected: 'Bị từ chối',
    expired: 'Hết hạn',
  }
  return labels[status] || status
}

export const getPrescriptionStatusVariant = (status: PrescriptionStatus): 'warning' | 'success' | 'danger' | 'info' => {
  const variants: Record<PrescriptionStatus, 'warning' | 'success' | 'danger' | 'info'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    expired: 'info',
  }
  return variants[status] || 'info'
}

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels: Record<PaymentMethod, string> = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank_transfer: 'Chuyển khoản ngân hàng',
    momo: 'Ví MoMo',
    vnpay: 'VNPay',
    zalopay: 'ZaloPay',
  }
  return labels[method] || method
}

export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}
