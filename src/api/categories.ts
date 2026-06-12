import axios from './axios'
import { ApiResponse, Category } from '../types'

export const categoryApi = {
  getList: () => axios.get<ApiResponse<Category[]>>('/categories').then(res => res.data),
}
