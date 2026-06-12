import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Search, 
  ShoppingCart, 
  User as UserIcon, 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  Plus,
  LayoutGrid,
  Home,
  Tag,
  Stethoscope,
  LogOut,
  Package,
  UserCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { productApi } from '../../api/products'
import { categoryApi } from '../../api/categories'
import { Product, Category } from '../../types'
import { useDebounce } from '../../hooks/useDebounce'
import { formatCurrency } from '../../utils/format'
import { NotificationDropdown } from './NotificationDropdown'

export const Header = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const { count, cart } = useCartStore()
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [activeParentId, setActiveParentId] = useState<string | null>(null)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const categoryMenuRef = useRef<HTMLDivElement>(null)
  const mobileSearchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    categoryApi.getList().then(res => setCategories(res.data))
  }, [])

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      productApi.getList({ search: debouncedSearch, per_page: 5 }).then(res => {
        setSuggestions(res.data)
        setShowSuggestions(true)
      })
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideDesktop = searchRef.current && !searchRef.current.contains(event.target as Node);
      const isOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node);
      
      if (isOutsideDesktop && isOutsideMobile) {
        setShowSuggestions(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  useEffect(() => {
    if (isCategoryMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isCategoryMenuOpen])

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setShowSuggestions(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      {/* Desktop Layout */}
      <div className="container mx-auto px-4">
        {/* Row 1: Logo, Search, Actions */}
        <div className="flex items-center justify-between h-14 md:h-16 gap-3 md:gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 min-w-fit">
            <img src="/logo.png" alt="PharmaVN Logo" className="w-10 h-10 object-contain" />
            <img src="/logo-text.png" alt="PharmaVN" className="h-8 object-contain hidden sm:block" />
          </Link>

          {/* Categories Dropdown (Moved next to Logo) */}
          <div 
            ref={categoryMenuRef}
            className="relative h-full hidden md:flex items-center"
          >
            <button 
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[13px] font-bold transition-all flex items-center gap-2",
                isCategoryMenuOpen 
                  ? "bg-primary text-white shadow-lg shadow-primary/30" 
                  : "bg-bg-subtle text-text-secondary hover:bg-primary/10 hover:text-primary"
              )}
            >
              <LayoutGrid size={16} />
              <span>Danh mục</span>
              <ChevronDown size={14} className={cn('transition-transform', isCategoryMenuOpen && 'rotate-180')} />
            </button>
            
            {/* AI Consultant Link */}
            <Link 
              to="/ai-consultant"
              className="ml-2 px-3 lg:px-4 py-1.5 rounded-full text-[13px] font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all hidden md:flex items-center gap-2 border border-emerald-100 shadow-sm whitespace-nowrap"
            >
              <Sparkles size={16} />
              <span className="hidden xl:inline">Tư vấn AI</span>
              <span className="inline xl:hidden">Tư vấn AI</span>
            </Link>
            
            {isCategoryMenuOpen && (
              <div className="absolute top-full left-0 flex bg-white border border-border rounded-b-[30px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50 max-h-[450px]">
                {/* Left Column: Parent Categories */}
                <div className="w-80 border-r border-border py-4 bg-bg-base/20 overflow-y-auto overflow-x-hidden custom-scrollbar">
                  {categories.filter(c => !c.parent_id).map(cat => (
                    <div 
                      key={cat.id}
                      onMouseEnter={() => setActiveParentId(cat.id)}
                      onClick={() => {
                        navigate(`/category/${cat.slug}`)
                        setIsCategoryMenuOpen(false)
                      }}
                      className={cn(
                        "px-6 py-4 text-[13px] cursor-pointer transition-all flex items-center justify-between group relative",
                        activeParentId === cat.id 
                          ? "bg-primary-light text-primary font-black z-10" 
                          : "text-text-secondary hover:bg-white/50"
                      )}
                    >
                      {activeParentId === cat.id && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                      )}
                      <div className="flex items-center gap-3">
                        {cat.icon_url && (
                          <img 
                            src={cat.icon_url} 
                            alt="" 
                            className={cn("w-5 h-5 object-contain transition-transform", activeParentId === cat.id && "scale-110")} 
                          />
                        )}
                        <span>{cat.name}</span>
                      </div>
                      <ChevronRight size={14} className={cn("transition-transform", activeParentId === cat.id ? "translate-x-1 opacity-100" : "opacity-0")} />
                    </div>
                  ))}
                </div>

                {/* Right Column: Child Categories (Mega Menu) */}
                {activeParentId && (
                  <div className="w-[840px] p-8 bg-white animate-in fade-in slide-in-from-left-4 duration-300 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <div className="grid grid-cols-5 gap-x-4 gap-y-6">
                      {categories.filter(c => c.parent_id === activeParentId).length > 0 ? (
                        categories.filter(c => c.parent_id === activeParentId).map(child => (
                          <Link
                            key={child.id}
                            to={`/category/${categories.find(c => c.id === activeParentId)?.slug}/${child.slug}`}
                            onClick={() => setIsCategoryMenuOpen(false)}
                            className="flex flex-col items-center text-center gap-2 p-1.5 rounded-xl hover:bg-bg-base hover:shadow-md transition-all group border border-transparent hover:border-border"
                          >
                            <div className="w-12 h-12 rounded-xl bg-bg-subtle flex items-center justify-center group-hover:bg-white transition-all shadow-sm">
                              {child.icon_url ? (
                                <img src={child.icon_url} alt="" className="w-6 h-6 object-contain" />
                              ) : (
                                <LayoutGrid size={18} className="text-text-muted group-hover:text-primary" />
                              )}
                            </div>
                            <p className="text-[11px] font-bold text-text-primary group-hover:text-primary transition-colors leading-tight line-clamp-2">{child.name}</p>
                          </Link>
                        ))
                      ) : (
                        <div className="col-span-5 flex flex-col items-center justify-center py-24 text-center opacity-40">
                          <LayoutGrid size={80} className="mb-6 text-text-muted" />
                          <p className="text-xl font-black">Hệ thống đang cập nhật dữ liệu</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-2xl relative hidden lg:block">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm thuốc, hoạt chất, triệu chứng..."
                className="w-full bg-bg-subtle border-none rounded-full pl-10 pr-4 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-[13px] text-text-primary"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
            </form>

            {/* Search Bar Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full right-0 mt-3 w-[550px] bg-white border border-border rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.18)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 z-50">
                <div className="p-3">
                  <div className="px-4 py-2 mb-1 flex items-center justify-between">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Sản phẩm gợi ý</p>
                    <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">{suggestions.length} kết quả</span>
                  </div>
                  
                  <div className="space-y-1">
                    {suggestions.map(product => (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-4 p-3 hover:bg-bg-subtle rounded-[20px] transition-all group"
                      >
                        <div className="w-14 h-14 rounded-xl bg-bg-subtle flex-shrink-0 overflow-hidden border border-border group-hover:border-primary/20 transition-colors relative">
                          <img 
                            src={product.primary_image} 
                            alt="" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-text-primary group-hover:text-primary transition-colors truncate leading-tight">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-[11px] text-text-muted font-bold">{product.unit}</p>
                            {product.brand && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-border" />
                                <p className="text-[11px] text-primary/70 font-black uppercase tracking-tighter">{product.brand.name}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-black text-primary font-mono leading-none">
                            {formatCurrency(product.current_price)}
                          </p>
                          {product.requires_prescription && (
                            <span className="text-[8px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-black uppercase mt-1.5 inline-block border border-rose-100">
                              Kê đơn
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSearch()}
                  className="w-full p-4 bg-bg-subtle hover:bg-primary hover:text-white text-primary text-[11px] font-black uppercase tracking-widest border-t border-border transition-all flex items-center justify-center gap-3 group"
                >
                  <span>Xem tất cả kết quả cho "{searchQuery}"</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>

          {/* User & Cart Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <NotificationDropdown />

            {/* User Dropdown */}
            <div ref={userMenuRef} className="relative hidden md:block">
              {isAuthenticated ? (
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 border border-border rounded-full hover:bg-bg-subtle transition-all"
                >
                  <div className="text-right hidden lg:block">
                    <p className="text-xs text-text-muted leading-tight">Xin chào</p>
                    <p className="text-sm font-bold text-text-primary leading-tight">{user?.full_name.split(' ').pop()}</p>
                  </div>
                  <div className="w-9 h-9 bg-primary-light text-primary rounded-full flex items-center justify-center font-bold">
                    {user?.full_name.charAt(0)}
                  </div>
                  <ChevronDown size={16} className={cn('text-text-muted transition-transform', isUserMenuOpen && 'rotate-180')} />
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    className="px-3 py-1.5 h-auto text-[11px] font-bold"
                    onClick={() => navigate('/login')}
                  >
                    Đăng nhập
                  </Button>
                  <Button 
                    variant="primary" 
                    className="px-4 py-1.5 h-auto text-[11px] font-bold rounded-full"
                    onClick={() => navigate('/register')}
                  >
                    Đăng ký
                  </Button>
                </div>
              )}

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-border rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-border mb-1">
                    <p className="text-sm font-bold text-text-primary truncate">{user?.full_name}</p>
                    <p className="text-xs text-text-muted truncate">{user?.email}</p>
                  </div>
                  <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-subtle transition-colors">
                    <Package size={18} />
                    Đơn hàng của tôi
                  </Link>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-subtle transition-colors">
                    <UserCircle size={18} />
                    Hồ sơ cá nhân
                  </Link>
                  <div className="h-px bg-border my-1" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                  >
                    <LogOut size={18} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>

            {/* Cart Icon & Dropdown */}
            <div className="relative group">
              <Link to="/cart" className="relative p-2 md:p-2.5 bg-primary-light text-primary rounded-full hover:bg-primary hover:text-white transition-all shadow-sm shadow-primary/10 flex items-center justify-center">
                <ShoppingCart size={20} className="md:w-6 md:h-6" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] md:text-[10px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
                    {count}
                  </span>
                )}
              </Link>

              {/* Cart Dropdown Preview */}
              <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 z-50">
                <div className="p-4 border-b border-border flex items-center justify-between bg-white">
                  <h3 className="font-bold text-text-primary">Giỏ hàng của bạn</h3>
                  <span className="text-xs px-2 py-0.5 bg-primary-light text-primary rounded-full font-bold">{count} sản phẩm</span>
                </div>
                
                <div className="max-h-64 overflow-y-auto custom-scrollbar bg-white">
                  {cart?.items && cart.items.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {cart.items.map(item => (
                        <Link 
                          key={item.id} 
                          to={`/products/${item.product.slug}`}
                          className="flex gap-3 p-2 hover:bg-bg-base rounded-xl transition-colors group/item"
                        >
                          <img 
                            src={item.product.primary_image} 
                            alt="" 
                            className="w-12 h-12 rounded-lg object-cover bg-bg-base border border-border" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-bold text-text-primary truncate group-hover/item:text-primary transition-colors">{item.product.name}</h4>
                            <p className="text-xs text-text-muted mt-0.5">{item.quantity} x <span className="text-primary font-bold">{formatCurrency(item.price_snapshot)}</span></p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <div className="w-16 h-16 bg-bg-subtle rounded-full flex items-center justify-center mx-auto mb-3">
                        <ShoppingCart size={32} className="text-text-muted/30" />
                      </div>
                      <p className="text-sm font-medium text-text-muted px-8">Giỏ hàng của bạn đang trống</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-4 text-primary"
                        onClick={() => navigate('/products')}
                      >
                        Mua sắm ngay
                      </Button>
                    </div>
                  )}
                </div>

                {cart?.items && cart.items.length > 0 && (
                  <div className="p-4 bg-bg-base border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-text-secondary">Tổng thanh toán:</span>
                      <span className="text-lg font-black text-primary">{formatCurrency(cart.summary.subtotal)}</span>
                    </div>
                    <Button 
                      fullWidth 
                      size="md" 
                      onClick={() => navigate('/cart')}
                      className="shadow-lg shadow-primary/20"
                    >
                      Xem chi tiết giỏ hàng
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Mobile Search Icon (only on mobile/tablet) */}
        <div className="lg:hidden flex items-center gap-4 pb-3">
          <div ref={mobileSearchRef} className="flex-1 relative">
            <form onSubmit={handleSearch} className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm thuốc, triệu chứng..." 
                className="w-full bg-bg-subtle border-none rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </form>

            {/* Mobile Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-[-16px] right-[-16px] mt-3 bg-white border-t border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                  {suggestions.map(product => (
                    <Link
                      key={product.id}
                      to={`/products/${product.slug}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 p-3 active:bg-bg-subtle rounded-xl transition-colors"
                    >
                      <img src={product.primary_image} alt={product.name} className="w-12 h-12 rounded-lg object-cover bg-bg-subtle" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-text-primary truncate">{product.name}</h4>
                        <p className="text-[10px] text-text-muted font-bold uppercase">{product.unit}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-primary font-mono">{formatCurrency(product.current_price)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <button
                  onClick={() => handleSearch()}
                  className="w-full p-4 text-center text-xs font-black text-primary hover:bg-primary-light border-t border-border transition-colors uppercase tracking-widest"
                >
                  Xem tất cả kết quả
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
