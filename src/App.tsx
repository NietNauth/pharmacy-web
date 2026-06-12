import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster, toast } from 'react-hot-toast'
import { Plus } from 'lucide-react'
import { useAuthStore } from './stores/authStore'
import { useCart } from './hooks/useCart'
import { cn } from './utils/cn'

// Layouts
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { MobileBottomNav } from './components/layout/MobileBottomNav'

// Shared Components
import { CartDrawer } from './components/shared/CartDrawer'
import { CategoryDrawer } from './components/shared/CategoryDrawer'
import { LiveChatWidget } from './components/shared/LiveChatWidget'

// Pages
import { HomePage } from './pages/HomePage'
import { ConsultantPage } from './pages/ConsultantPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { ProductsPage } from './pages/products/ProductsPage'
import { ProductDetailPage } from './pages/products/ProductDetailPage'
import { CartPage } from './pages/cart/CartPage'
import { CheckoutPage } from './pages/checkout/CheckoutPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { OrderDetailPage } from './pages/orders/OrderDetailPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { BranchesPage } from './pages/BranchesPage'
import NotificationsPage from './pages/NotificationsPage'
import { VNPayReturnPage } from './pages/checkout/VNPayReturnPage'
import { MomoReturnPage } from './pages/checkout/MomoReturnPage'
import { NotFoundPage } from './pages/NotFoundPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />
  }

  return <>{children}</>
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isDrawerOpen, closeDrawer } = useCart()
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = React.useState(false)
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || 
                    location.pathname === '/register' || 
                    location.pathname === '/forgot-password' || 
                    location.pathname === '/reset-password'
  const isConsultantPage = location.pathname === '/ai-consultant'

  React.useEffect(() => {
    const handleOpenCategory = () => setIsCategoryDrawerOpen(true)
    window.addEventListener('open-category-drawer', handleOpenCategory)
    return () => window.removeEventListener('open-category-drawer', handleOpenCategory)
  }, [])

  if (isAuthPage) return <>{children}</>

  return (
    <div className="flex flex-col min-h-screen bg-bg-base">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
      
      {/* Persistent Widgets */}
      <CartDrawer open={isDrawerOpen} onClose={closeDrawer} />
      <CategoryDrawer open={isCategoryDrawerOpen} onClose={() => setIsCategoryDrawerOpen(false)} />
      <LiveChatWidget />
    </div>
  )
}

const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <MainLayout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/ai-consultant" element={<ConsultantPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/category/:categorySlug" element={<ProductsPage />} />
            <Route path="/category/:parentSlug/:categorySlug" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/branches" element={<BranchesPage />} />

            {/* Protected Routes */}
            <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
            <Route path="/checkout/vnpay-return" element={<ProtectedRoute><VNPayReturnPage /></ProtectedRoute>} />
            <Route path="/checkout/momo-return" element={<ProtectedRoute><MomoReturnPage /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/orders/:code" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MainLayout>
        <Toaster 
          position="top-right" 
          containerStyle={{ top: 80, right: 20 }}
          toastOptions={{
            duration: 3500,
          }} 
        >
          {(t) => (
            <div
              className={cn(
                "toast-container transition-all duration-500 shadow-xl shadow-primary/10",
                t.visible ? 'animate-in fade-in zoom-in-95 slide-in-from-right-4' : 'animate-out fade-out zoom-out-95 slide-out-to-right-4'
              )}
            >
              <div className="toast-border" />
              <div className="relative bg-primary-light px-6 py-3 rounded-[14px] flex items-center justify-center min-w-[160px] max-w-xs">
                <p className="text-[13px] font-black tracking-tight text-center leading-tight text-primary">
                  {typeof t.message === 'function' ? t.message(t) : t.message}
                </p>
              </div>
            </div>
          )}
        </Toaster>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
