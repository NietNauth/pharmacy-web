import axios from './axios'
import { ApiResponse, PaginatedResponse, Product, ProductDetail, ProductQa } from '../types'

export const productApi = {
  getList: (params: any) => 
    axios.get<PaginatedResponse<Product>>('/products', { params }).then(res => res.data),
  getBySlug: (slug: string) => 
    axios.get<ApiResponse<ProductDetail>>(`/products/${slug}`).then(res => res.data),
  getQas: (productId: string, params: any) => 
    axios.get<PaginatedResponse<ProductQa>>(`/products/${productId}/qas`, { params }).then(res => res.data),
  submitQa: (productId: string, data: any) => 
    axios.post<ApiResponse<ProductQa>>(`/products/${productId}/qas`, data).then(res => res.data),
}
