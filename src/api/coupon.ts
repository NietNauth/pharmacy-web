import axios from './axios'
import { ApiResponse } from '../types'

export interface CouponCheckResult {
  coupon_id: string
  code: string
  discount_amount: number
  discount_type: 'percent' | 'fixed'
}

export const couponApi = {
  check: (code: string, subtotal: number) => 
    axios.post<ApiResponse<CouponCheckResult>>('/coupons/check', { code, subtotal }).then(res => res.data),
}
