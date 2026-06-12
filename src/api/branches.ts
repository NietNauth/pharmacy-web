import axios from './axios'
import { ApiResponse, Branch } from '../types'

export const branchApi = {
  getList: () => axios.get<ApiResponse<Branch[]>>('/branches').then(res => res.data),
}
