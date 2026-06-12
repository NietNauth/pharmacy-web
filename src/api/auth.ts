import axios from './axios'
import { ApiResponse, User, UserAddress } from '../types'

export const authApi = {
  login: (payload: any) => axios.post<ApiResponse<{ user: User; token: string }>>('/auth/login', payload).then(res => res.data),
  register: (payload: any) => axios.post<ApiResponse<any>>('/auth/register', payload).then(res => res.data),
  logout: () => axios.post<ApiResponse<any>>('/auth/logout').then(res => res.data),
  getMe: () => axios.get<ApiResponse<User>>('/auth/me').then(res => res.data),
  forgotPassword: (email: string) => axios.post<ApiResponse<any>>('/auth/forgot-password', { email }).then(res => res.data),
  resetPassword: (data: any) => axios.post<ApiResponse<any>>('/auth/reset-password', data).then(res => res.data),
  resendVerification: () => axios.post<ApiResponse<any>>('/auth/resend-verification').then(res => res.data),
  updateProfile: (data: any) => axios.put<ApiResponse<User>>('/auth/profile', data).then(res => res.data),
  changePassword: (data: any) => axios.post<ApiResponse<any>>('/auth/change-password', data).then(res => res.data),
  getAddresses: () => axios.get<ApiResponse<UserAddress[]>>('/auth/addresses').then(res => res.data),
  addAddress: (data: any) => axios.post<ApiResponse<UserAddress>>('/auth/addresses', data).then(res => res.data),
  updateAddress: (id: string, data: any) => axios.put<ApiResponse<UserAddress>>(`/auth/addresses/${id}`, data).then(res => res.data),
  deleteAddress: (id: string) => axios.delete<ApiResponse<any>>(`/auth/addresses/${id}`).then(res => res.data),
}
