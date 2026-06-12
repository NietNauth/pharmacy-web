import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
})

axiosInstance.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('pharma_auth')
    if (authData) {
      try {
        const { state } = JSON.parse(authData)
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth data', error)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && window.location.pathname !== '/login' && !isLoginRequest) {
      localStorage.removeItem('pharma_auth')
      window.location.href = '/login'
    }
    
    const data = error.response?.data
    let message = data?.message || error.message || 'Có lỗi xảy ra'
    
    // If there are specific validation errors, pick the first one
    if (data?.errors && typeof data.errors === 'object') {
      const firstError = Object.values(data.errors)[0]
      if (Array.isArray(firstError) && firstError.length > 0) {
        message = firstError[0]
      }
    }
    
    return Promise.reject(new Error(message))
  }
)

export default axiosInstance
