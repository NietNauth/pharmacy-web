import axios from './axios'
import { ApiResponse, Prescription } from '../types'

export const prescriptionApi = {
  getList: () => axios.get<ApiResponse<Prescription[]>>('/prescriptions').then(res => res.data),
  upload: (data: FormData) => 
    axios.post<ApiResponse<Prescription>>('/prescriptions', data).then(res => res.data),
}
