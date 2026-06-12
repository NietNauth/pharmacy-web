import { useAuthStore } from '../stores/authStore'

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore()

  return {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isPharmacist: user?.role === 'pharmacist',
    isCustomer: user?.role === 'customer',
    setAuth,
    clearAuth
  }
}
