import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShoppingCart,
  Plus,
  Minus,
  ShieldCheck,
  Zap,
  ChevronRight,
  Share2,
  Heart,
  Info,
  MessageCircle,
  MessageSquare,
  FileText,
  Upload,
  AlertCircle,
  Package,
  Award,
  RefreshCw
} from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { ProductCard } from '../../components/shared/ProductCard'
import { EmptyState } from '../../components/shared/EmptyState'
import { productApi } from '../../api/products'
import { useAuthStore } from '../../stores/authStore'
import { cartApi } from '../../api/cart'
import { useCartStore } from '../../stores/cartStore'
import { categoryApi } from '../../api/categories'
import { formatCurrency, getDiscountPercent, formatRelativeTime } from '../../utils/format'
import { cn } from '../../utils/cn'
import { toast } from 'react-hot-toast'

export const ProductDetailPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { setCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<string>('')
  const [activeImage, setActiveImage] = useState(0)
  const [showQaForm, setShowQaForm] = useState(false)

  const { data: productRes, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getBySlug(slug!),
    enabled: !!slug
  })

  const [qaLimit, setQaLimit] = useState(5)
  
  // Reset limit when changing products
  React.useEffect(() => {
    setQaLimit(5)
  }, [slug])

  const { data: qasData } = useQuery({
    queryKey: ['qas', slug, qaLimit],
    queryFn: () => productApi.getQas(productRes!.data.id, { per_page: qaLimit }),
    enabled: !!productRes?.data.id && productRes.data.slug === slug
  })

  const { data: relatedProducts } = useQuery({
    queryKey: ['products', 'related', productRes?.data.category.id],
    queryFn: () => productApi.getList({ category_id: productRes?.data.category.id, per_page: 6 }),
    enabled: !!productRes?.data.category.id
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getList()
  })

  const [relatedRef] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' })

  const product = productRes?.data

  const handleAddToCart = async (buyNow = false) => {
    if (!product) return
    if (product.requires_prescription) {
      toast.error('Sản phẩm này cần đơn thuốc. Vui lòng nhắn tin với dược sĩ.', { icon: '💬' })
      return
    }

    if (!isAuthenticated) {
      useCartStore.getState().addGuestItem(product, quantity)
      toast.success(`Đã thêm ${quantity} ${product.unit} vào giỏ hàng tạm`)
      if (buyNow) navigate('/cart')
      return
    }

    try {
      const res = await cartApi.addItem({ product_id: product.id, quantity })
      setCart(res.data)
      toast.success(`Đã thêm ${quantity} ${product.unit} vào giỏ hàng`)
      if (buyNow) navigate('/cart')
    } catch (error: any) {
      toast.error(error.message)
    }
  }


  const [qaBody, setQaBody] = useState('')
  const [submittingQa, setSubmittingQa] = useState(false)

  const submitQaMutation = useMutation({
    mutationFn: (body: string) => productApi.submitQa(product!.id, { body }),
    onSuccess: () => {
      toast.success('Câu hỏi của bạn đã được gửi tới dược sĩ.', { icon: '💬' })
      setQaBody('')
      setShowQaForm(false)
      queryClient.invalidateQueries({ queryKey: ['qas', product?.id] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Không thể gửi câu hỏi. Vui lòng thử lại.')
    }
  })

  const handleSubmitQa = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đặt câu hỏi.', { icon: '🔑' })
      navigate('/login', { state: { from: `/products/${slug}` } })
      return
    }

    if (!qaBody.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi.')
      return
    }
    submitQaMutation.mutate(qaBody)
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Offset for header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveTab(id);
    }
  };

  if (isLoading) return (
    <PageWrapper maxWidth="6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Skeleton variant="rect" className="aspect-square rounded-3xl" />
        <div className="space-y-6">
          <Skeleton variant="text" className="w-1/4 h-6" />
          <Skeleton variant="text" className="w-3/4 h-10" />
          <Skeleton variant="text" className="w-1/2 h-8" />
          <Skeleton variant="rect" className="w-full h-32" />
        </div>
      </div>
    </PageWrapper>
  )

  if (!product) return null

  const discount = getDiscountPercent(product.base_price, product.sale_price || product.current_price)

  return (
    <PageWrapper>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-text-muted mb-8 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-primary">Trang chủ</Link>
        <ChevronRight size={12} />
        <Link to="/products" className="hover:text-primary">Sản phẩm</Link>
        <ChevronRight size={12} />
        {(() => {
          const currentCat = categories?.data.find(c => c.id === product.category.id);
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
              <Link 
                to={parentCat ? `/category/${parentCat.slug}/${currentCat.slug}` : `/category/${currentCat.slug}`} 
                className="hover:text-primary"
              >
                {currentCat.name}
              </Link>
              <ChevronRight size={12} />
            </>
          );
        })()}
        <span className="text-text-primary font-bold">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-12">
        {/* Left: Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-white shadow-xl shadow-sky-500/5 group">
            <img
              src={product.images[activeImage]?.url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            {product.requires_prescription && (
              <Badge variant="error" className="absolute top-6 left-6 px-4 py-1.5 text-sm shadow-xl">Thuốc kê đơn</Badge>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  'w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all',
                  activeImage === i ? 'border-primary shadow-lg scale-95' : 'border-border hover:border-primary/50'
                )}
              >
                <img src={img.url} alt={product.name} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="info" className="px-3 py-1 uppercase tracking-widest font-black text-[10px]">
                  {product.brand?.name || 'PharmaVN'}
                </Badge>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  Mã: {product.sku}
                </span>
              </div>
              <button className="text-text-muted hover:text-primary transition-colors">
                <Share2 size={20} />
              </button>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-text-primary leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-6">
              <button
                onClick={() => scrollToSection('qna')}
                className="text-sm font-bold text-primary hover:underline flex items-center gap-1.5"
              >
                <MessageSquare size={16} />
                Hỏi & Đáp về sản phẩm
              </button>
              <div className="w-px h-4 bg-border" />
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                <ShieldCheck size={16} /> Đã kiểm định
              </span>
            </div>
          </div>

          <div className="bg-bg-subtle/50 rounded-2xl p-6 mb-6 border border-border/50">
            <div className="space-y-1 mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-primary font-mono">{formatCurrency(product.current_price)}</span>
                <span className="text-sm font-bold text-text-muted uppercase">/ {product.unit}</span>
              </div>
              {product.sale_price && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted line-through font-mono">{formatCurrency(product.base_price)}</span>
                  <Badge variant="warning" className="px-1.5 py-0.5 text-[10px]">Tiết kiệm {discount}%</Badge>
                </div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4">
                <p className="w-40 text-[10px] font-bold text-text-muted uppercase tracking-widest shrink-0 whitespace-nowrap">Phân loại sản phẩm</p>
                <div className="px-3 py-1 bg-primary/5 border border-primary text-primary rounded-lg text-xs font-bold">
                  {product.unit}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="w-40 text-[10px] font-bold text-text-muted uppercase tracking-widest shrink-0 whitespace-nowrap">Số lượng</p>
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center border border-border rounded-lg bg-white p-0.5">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="p-2 hover:bg-bg-subtle rounded-lg text-text-muted transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-10 text-center font-black text-base">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => q + 1)}
                      className="p-2 hover:bg-bg-subtle rounded-lg text-text-muted transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                size="lg"
                fullWidth
                onClick={() => handleAddToCart()}
                disabled={product.status === 'out_of_stock'}
              >
                <ShoppingCart size={22} className="mr-2" />
                Thêm vào giỏ
              </Button>
              <Button
                variant="success"
                size="lg"
                fullWidth
                onClick={() => handleAddToCart(true)}
                disabled={product.status === 'out_of_stock'}
              >
                Mua ngay
              </Button>
            </div>
          </div>

          {product.requires_prescription && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 mb-8 flex gap-4 animate-pulse">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle size={24} />
              </div>
              <div className="space-y-2 flex-1">
                <h4 className="text-sm font-black text-rose-700 uppercase tracking-tight">Sản phẩm cần có đơn thuốc</h4>
                <p className="text-xs text-rose-600 leading-relaxed font-medium">
                  Sản phẩm này chỉ được bán khi có đơn chỉ định của bác sĩ. Vui lòng nhắn tin với dược sĩ để được tư vấn và hỗ trợ mua hàng.
                </p>
                <Button 
                  size="sm" 
                  variant="danger" 
                  className="mt-1"
                  onClick={() => window.dispatchEvent(new CustomEvent('open-live-chat'))}
                >
                  <MessageCircle size={16} className="mr-2" />
                  Nhắn tin với dược sĩ
                </Button>
              </div>
            </div>
          )}

          {/* Quick Features Section */}
          <div className="flex flex-wrap items-center justify-between gap-2 py-4 border-y border-border/50">
            {[
              { icon: <ShieldCheck size={16} />, text: 'Chính hãng 100%' },
              { icon: <Zap size={16} />, text: 'Giao hàng siêu tốc' },
              { icon: <Award size={16} />, text: 'Tư vấn chuyên môn' }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="text-primary">{f.icon}</div>
                <p className="text-[10px] font-bold text-text-primary uppercase tracking-tight whitespace-nowrap">{f.text}</p>
              </div>
            ))}
          </div>

          {/* Quick Info Table */}
          <div className="mt-8">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              Thông tin chi tiết
            </h3>
            <div className="border border-border rounded-xl overflow-hidden bg-bg-subtle/20">
              {[
                { label: 'Mã sản phẩm', value: product.sku },
                { label: 'Danh mục', value: product.category?.name },
                { label: 'Dạng bào chế', value: product.dosage_form || 'Đang cập nhật' },
                { label: 'Công dụng', value: product.usage ? product.usage.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : 'Xem chi tiết' },
                { label: 'Lưu ý', value: product.notes ? product.notes.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : 'Xem chi tiết' },
              ].map((item, idx) => (
                <div key={idx} className={cn(
                  "flex items-start py-3 px-4 text-xs md:text-sm",
                  idx !== 0 && "border-t border-border/50"
                )}>
                  <span className="w-32 md:w-40 font-bold text-text-muted shrink-0 uppercase tracking-tighter">{item.label}</span>
                  <span className="font-semibold text-text-primary leading-relaxed">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

            {/* Tabs Section as Navigation */}
      <section className="mb-16">
        <div className="sticky top-14 md:top-20 z-10 bg-white/95 backdrop-blur-md border border-border rounded-2xl mb-2 overflow-x-auto scrollbar-hide shadow-sm shadow-primary/5">
          <div className="flex px-2">
            {[
              ...product.attributes.map((attr, idx) => ({
                id: `attr-${idx}`,
                label: attr.key,
                icon: <FileText size={18} />
              })),
              { id: 'qna', label: `Hỏi & Đáp`, icon: <MessageSquare size={18} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 my-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border',
                  activeTab === tab.id
                    ? 'bg-primary-light text-primary border-primary shadow-sm'
                    : 'border-transparent text-text-muted hover:text-text-primary hover:bg-bg-subtle'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {product.attributes.map((attr, idx) => (
            <div key={idx} id={`attr-${idx}`} className="scroll-mt-32 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-bg-subtle/30 px-6 py-2.5 border-b border-border/50 flex items-center gap-3">
                  <div className="w-1 h-4 bg-primary rounded-full" />
                  <h4 className="text-xs font-black text-text-primary uppercase tracking-widest">{attr.key}</h4>
                </div>
                <div className="px-6 py-3 prose prose-sm prose-p:my-1 prose-headings:mb-2 prose-headings:mt-0 max-w-none text-text-primary leading-relaxed break-words">
                  <div dangerouslySetInnerHTML={{ __html: attr.value }} />
                </div>
              </div>
            </div>
          ))}

          <div id="qna" className="scroll-mt-32 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-text-primary mb-1 flex items-center gap-2">
                    <MessageSquare size={24} className="text-primary" />
                    Hỏi & Đáp về sản phẩm
                  </h3>
                  <p className="text-sm text-text-muted">Mọi thắc mắc của bạn sẽ được đội ngũ dược sĩ giải đáp tận tình</p>
                </div>

              {/* Question Form - Always visible */}
              <div className="mb-12 p-4 bg-bg-subtle/30 rounded-3xl border border-primary/10">
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-text-primary">Đặt câu hỏi cho dược sĩ</h4>
                  <textarea 
                    className="w-full px-4 py-3 bg-white border border-border rounded-xl text-sm outline-none focus:border-primary min-h-[48px]"
                    placeholder="Nhập câu hỏi của bạn về cách dùng, liều lượng hoặc tác dụng phụ..."
                    value={qaBody}
                    onChange={(e) => setQaBody(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleSubmitQa} 
                      loading={submitQaMutation.isPending}
                      size="sm"
                      className="shadow-lg shadow-primary/20"
                    >
                      Gửi câu hỏi
                    </Button>
                  </div>
                </div>
              </div>

              {/* Q&A List */}
              <div className="space-y-8 pt-8 border-t border-border">
                {qasData?.data && qasData.data.length > 0 ? (
                  qasData.data.map((qa) => (
                    <div key={qa.id} className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-400">
                          {qa.user?.full_name?.charAt(0) || 'K'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-text-primary text-sm">{qa.user?.full_name || 'Khách hàng'}</span>
                            <span className="text-[10px] text-text-muted">{formatRelativeTime(qa.created_at)}</span>
                          </div>
                          <p className="text-sm text-text-primary leading-relaxed">{qa.body}</p>
                        </div>
                      </div>

                      {qa.admin_reply && (
                        <div className="ml-14 p-4 bg-primary-light/30 rounded-2xl border border-primary/10 relative">
                          <div className="absolute -top-2 left-6 w-4 h-4 bg-primary-light/30 border-t border-l border-primary/10 rotate-45" />
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <ShieldCheck size={14} className="text-white" />
                            </div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-wider">Dược sĩ PharmaVN trả lời</span>
                          </div>
                          <p className="text-sm text-text-primary leading-relaxed italic">
                            "{qa.admin_reply}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <MessageSquare size={40} />
                    </div>
                    <h4 className="text-lg font-bold text-text-primary mb-2">Chưa có câu hỏi nào</h4>
                    <p className="text-sm text-text-muted max-w-md mx-auto">
                      Bạn có thắc mắc về sản phẩm này? Đừng ngần ngại đặt câu hỏi để nhận được sự tư vấn chuyên môn từ PharmaVN!
                    </p>
                  </div>
                )}

                {/* Load More Button */}
                {qasData?.meta && qasData.meta.total > qaLimit && (
                  <div className="text-center pt-8 border-t border-border mt-8">
                    <Button variant="secondary" onClick={() => setQaLimit(l => l + 5)}>
                      Xem thêm câu hỏi ({qasData.meta.total - qaLimit})
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="mb-16">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-black text-text-primary">Sản phẩm tương tự</h2>
            <p className="text-sm text-text-muted font-medium">Có thể bạn cũng quan tâm</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-bg-subtle hover:bg-primary hover:text-white flex items-center justify-center transition-all">
              <ChevronRight size={20} className="rotate-180" />
            </button>
            <button className="w-10 h-10 rounded-full bg-bg-subtle hover:bg-primary hover:text-white flex items-center justify-center transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={relatedRef}>
          <div className="flex gap-6">
            {relatedProducts?.data.map(p => (
              <div key={p.id} className="flex-[0_0_100%] sm:flex-[0_0_48%] lg:flex-[0_0_23%] min-w-0">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  )
}
