import React, { useState, useEffect } from 'react'
import { useSearchParams, Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  Filter, 
  Grid as GridIcon, 
  List as ListIcon, 
  ChevronDown, 
  X, 
  Search, 
  ChevronRight,
  SlidersHorizontal,
  Plus,
  LayoutGrid
} from 'lucide-react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { ProductCard } from '../../components/shared/ProductCard'
import { ProductCardSkeleton } from '../../components/shared/ProductCardSkeleton'
import { EmptyState } from '../../components/shared/EmptyState'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Pagination } from '../../components/ui/Pagination'
import { Modal } from '../../components/ui/Modal'
import { productApi } from '../../api/products'
import { categoryApi } from '../../api/categories'
import { cn } from '../../utils/cn'

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)

  const { categorySlug } = useParams()
  
  // Queries
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getList
  })

  // Filters State from URL
  const query = searchParams.get('search') || ''
  const categoryIdFromUrl = searchParams.get('category_id') || ''
  const categoryFromSlug = categorySlug ? categories?.data.find(c => c.slug === categorySlug)?.id : null
  const categoryId = categoryFromSlug || categoryIdFromUrl
  
  const brandId = searchParams.get('brand_id') || ''
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = parseInt(searchParams.get('page') || '1')
  const requiresPrescription = searchParams.get('requires_prescription') === 'true'

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', query, categoryId, brandId, minPrice, maxPrice, sort, page, requiresPrescription],
    queryFn: () => productApi.getList({
      search: query,
      category_id: categoryId,
      brand_id: brandId,
      min_price: minPrice,
      max_price: maxPrice,
      sort,
      page,
      requires_prescription: requiresPrescription ? true : undefined,
      per_page: 12
    })
  })

  const handleFilterChange = (key: string, value: string | boolean) => {
    const newParams = new URLSearchParams(searchParams)
    if (!value || value === 'false') {
      newParams.delete(key)
    } else {
      newParams.set(key, String(value))
    }
    if (key !== 'page') {
      newParams.set('page', '1') // Reset to page 1 on filter
    }
    setSearchParams(newParams)
  }

  const handlePriceRange = (min: string, max: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (min) newParams.set('min_price', min)
    else newParams.delete('min_price')
    
    if (max) newParams.set('max_price', max)
    else newParams.delete('max_price')
    
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const Sidebar = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-black text-lg text-text-primary uppercase tracking-wider">Bộ lọc</h3>
        {(categoryId || brandId || minPrice || maxPrice || requiresPrescription) && (
          <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">Xóa tất cả</button>
        )}
      </div>


      {/* Price Range */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-text-primary">Khoảng giá (₫)</h4>
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Từ" 
            type="number" 
            value={minPrice} 
            onChange={(e) => handleFilterChange('min_price', e.target.value)}
            className="text-xs py-2 h-9"
          />
          <span className="text-text-muted">—</span>
          <Input 
            placeholder="Đến" 
            type="number" 
            value={maxPrice} 
            onChange={(e) => handleFilterChange('max_price', e.target.value)}
            className="text-xs py-2 h-9"
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: 'Dưới 100k', min: '', max: '100000' },
            { label: '100k - 500k', min: '100000', max: '500000' },
            { label: 'Trên 500k', min: '500000', max: '' },
          ].map((range, i) => (
            <button
              key={i}
              onClick={() => handlePriceRange(range.min, range.max)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                (minPrice === range.min && maxPrice === range.max)
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-white border-border text-text-secondary hover:border-primary/50 hover:text-primary"
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Other Filters */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-text-primary">Đặc điểm</h4>
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={cn(
            'w-10 h-5 rounded-full relative transition-all duration-300',
            requiresPrescription ? 'bg-primary' : 'bg-gray-200'
          )}>
            <div className={cn(
              'absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300',
              requiresPrescription ? 'left-6' : 'left-1'
            )} />
            <input 
              type="checkbox" 
              className="hidden" 
              checked={requiresPrescription}
              onChange={(e) => handleFilterChange('requires_prescription', e.target.checked)}
            />
          </div>
          <span className="text-sm text-text-secondary font-medium group-hover:text-primary transition-colors">Thuốc kê đơn</span>
        </label>
      </div>

      {/* Promo Banner in Sidebar */}
      <div className="bg-gradient-to-br from-primary to-sky-400 rounded-3xl p-6 text-white overflow-hidden relative group">
        <Plus size={80} className="absolute -bottom-4 -right-4 text-white/10 rotate-12 group-hover:scale-110 transition-transform" />
        <h5 className="font-black text-lg mb-2 relative z-10 leading-tight">Bạn cần dược sĩ tư vấn?</h5>
        <p className="text-xs text-white/80 mb-4 relative z-10 leading-relaxed">Kết nối ngay với đội ngũ dược sĩ chuyên môn để được hỗ trợ tốt nhất.</p>
        <Button variant="secondary" size="sm" className="border-none text-[#0ea5e9] hover:text-[#0284c7] relative z-10" onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}>
          Chat ngay
        </Button>
      </div>
    </div>
  )

  return (
    <PageWrapper maxWidth="7xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <ChevronRight size={12} />
        {categoryId ? (
          <>
            <Link to="/products" className="hover:text-primary">Sản phẩm</Link>
            <ChevronRight size={12} />
            {(() => {
              const currentCat = categories?.data.find(c => c.id === categoryId);
              const parentCat = currentCat?.parent_id ? categories?.data.find(c => c.id === currentCat.parent_id) : null;
              
              if (!currentCat) return null;

              return (
                <>
                  {parentCat && (
                    <>
                      <Link to={`/category/${parentCat.slug}`} className="hover:text-primary">{parentCat.name}</Link>
                      <ChevronRight size={12} />
                    </>
                  )}
                  <span className="text-text-primary font-bold">{currentCat.name}</span>
                </>
              );
            })()}
          </>
        ) : (
          <span className="text-text-primary font-bold">Tất cả sản phẩm</span>
        )}
      </div>

      {/* Sub-categories Grid (Only for parent categories) */}
      {(() => {
        const currentCat = categories?.data.find(c => c.id === categoryId);
        const children = categories?.data.filter(c => c.parent_id === categoryId) || [];
        
        if (children.length > 0 && !currentCat?.parent_id) {
          return (
            <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {children.map(child => (
                  <Link
                    key={child.id}
                    to={`/category/${currentCat?.slug}/${child.slug}`}
                    className="group flex flex-col items-center gap-3 p-4 bg-white border border-border rounded-2xl hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-bg-subtle flex items-center justify-center group-hover:bg-primary-light transition-colors">
                      {child.icon_url ? (
                        <img src={child.icon_url} alt="" className="w-10 h-10 object-contain" />
                      ) : (
                        <LayoutGrid size={24} className="text-text-muted group-hover:text-primary" />
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-text-primary text-center group-hover:text-primary line-clamp-2">{child.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        }
        return null;
      })()}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">
          {/* Header Bar */}
          <div className="bg-white border border-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black text-text-primary">
                {query ? `Kết quả cho "${query}"` : 'Tất cả sản phẩm'}
              </h1>
              <span className="bg-bg-subtle text-text-muted text-[10px] font-black px-2 py-1 rounded-lg border border-border/50 uppercase tracking-widest">
                {productsData?.meta.total || 0} sản phẩm
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle */}
              <Button 
                variant="secondary" 
                size="sm" 
                className="lg:hidden"
                onClick={() => setIsFilterModalOpen(true)}
              >
                <Filter size={18} className="mr-2" />
                Bộ lọc
              </Button>

              <div className="flex items-center bg-bg-subtle rounded-xl p-1 gap-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-1.5 rounded-lg transition-all',
                    viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  <GridIcon size={20} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-1.5 rounded-lg transition-all',
                    viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-text-secondary'
                  )}
                >
                  <ListIcon size={20} />
                </button>
              </div>

              <div className="w-48">
                <Select 
                  value={sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  options={[
                    { value: 'newest', label: 'Mới nhất' },
                    { value: 'popular', label: 'Phổ biến' },
                    { value: 'price_asc', label: 'Giá tăng dần' },
                    { value: 'price_desc', label: 'Giá giảm dần' },
                    { value: 'rating', label: 'Đánh giá cao' },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Product Grid/List */}
          {isLoading ? (
            <div className={cn(
              'grid gap-4',
              viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
            )}>
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : !productsData || productsData.data.length === 0 ? (
            <EmptyState 
              icon={<Search size={48} />}
              title="Không tìm thấy sản phẩm"
              description="Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc hiện tại."
              action={<Button onClick={clearFilters}>Xóa tất cả bộ lọc</Button>}
              className="bg-white rounded-3xl border border-border"
            />
          ) : (
            <>
              <div className={cn(
                'grid gap-4',
                viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'
              )}>
                {productsData.data.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    variant={viewMode}
                    className="animate-in fade-in zoom-in-95 duration-300"
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination 
                currentPage={page}
                totalPages={productsData.meta.last_page}
                onPageChange={(p) => handleFilterChange('page', String(p))}
                totalItems={productsData.meta.total}
              />
            </>
          )}
        </main>
      </div>

      {/* Mobile Filter Modal */}
      <Modal 
        open={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)}
        title="Bộ lọc sản phẩm"
        size="sm"
        footer={
          <div className="grid grid-cols-2 gap-4">
            <Button variant="secondary" onClick={clearFilters}>Xóa hết</Button>
            <Button onClick={() => setIsFilterModalOpen(false)}>Áp dụng</Button>
          </div>
        }
      >
        <Sidebar />
      </Modal>
    </PageWrapper>
  )
}
