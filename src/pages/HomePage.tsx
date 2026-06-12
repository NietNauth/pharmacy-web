import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Headphones, 
  RefreshCw, 
  Bot,
  ArrowRight,
  LayoutGrid,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { ProductCard } from '../components/shared/ProductCard'
import { CategoryCard } from '../components/shared/CategoryCard'
import { ProductCardSkeleton } from '../components/shared/ProductCardSkeleton'
import { productApi } from '../api/products'
import { categoryApi } from '../api/categories'
import { slideApi } from '../api/slides'
import { cn } from '../utils/cn'
import { Reveal } from '../components/ui/Reveal'
import { Category } from '../types'

const FeaturedCategorySection = ({ 
  parent, 
  allCategories, 
  navigate 
}: { 
  parent: Category, 
  allCategories: Category[], 
  navigate: (path: string) => void 
}) => {
  const children = allCategories.filter(c => c.parent_id === parent.id)
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start', 
    containScroll: 'trimSnaps',
    slidesToScroll: 1
  })

  // Group children into columns of 2, but ensuring Row 1 fills first
  // Row 1: 1, 2, 3, 4...
  // Row 2: 9, 10, 11, 12...
  const columns = []
  const half = Math.ceil(children.length / 2)
  for (let i = 0; i < half; i++) {
    const col = [children[i]]
    if (children[i + half]) {
      col.push(children[i + half])
    }
    columns.push(col)
  }

  if (children.length === 0) return null

  return (
    <Reveal delay={0.1}>
      <section className="mb-12">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-black md:text-3xl text-text-primary">{parent.name}</h2>
            <p className="text-sm font-medium text-text-muted">Khám phá các sản phẩm {parent.name.toLowerCase()} chất lượng</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => emblaApi?.scrollPrev()} 
              className="flex items-center justify-center w-10 h-10 transition-all bg-white border rounded-full shadow-sm border-border hover:bg-primary hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => emblaApi?.scrollNext()} 
              className="flex items-center justify-center w-10 h-10 transition-all bg-white border rounded-full shadow-sm border-border hover:bg-primary hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {columns.map((col, idx) => (
              <div key={idx} className="flex-[0_0_40%] sm:flex-[0_0_22%] lg:flex-[0_0_12.5%] min-w-0 flex flex-col gap-4">
                {col.map(child => (
                  <CategoryCard 
                    key={child.id} 
                    category={child} 
                    onClick={() => navigate(`/category/${parent.slug}/${child.slug}`)}
                  />
                ))}
                {/* Placeholder if column has only 1 item to keep spacing */}
                {col.length === 1 && <div className="invisible h-[120px]" />}
              </div>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  )
}


export const HomePage = () => {
  const navigate = useNavigate()
  
  // Carousel setup for Hero
  const [heroRef, heroEmbla] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })])
  const [heroIndex, setHeroIndex] = React.useState(0)

  // Carousel setup for Best Sellers
  const [bestRef, bestEmbla] = useEmblaCarousel({ 
    align: 'start', 
    containScroll: 'trimSnaps',
    slidesToScroll: 1
  })

  React.useEffect(() => {
    if (!heroEmbla) return
    heroEmbla.on('select', () => setHeroIndex(heroEmbla.selectedScrollSnap()))
  }, [heroEmbla])

  // Queries
  const { data: categories, isLoading: isCatsLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getList
  })

  const { data: bestSellers, isLoading: isBestLoading } = useQuery({
    queryKey: ['products', 'best-sellers'],
    queryFn: () => productApi.getList({ sort: 'rating', per_page: 8 })
  })

  const { data: newestProducts, isLoading: isNewestLoading } = useQuery({
    queryKey: ['products', 'newest'],
    queryFn: () => productApi.getList({ sort: 'newest', per_page: 8 })
  })

  // Get the category marked by admin to show products on home page
  const featuredHomeCategory = categories?.data.find(cat => !cat.parent_id && cat.show_on_home)

  const { data: categoryProducts, isLoading: isCatProductsLoading } = useQuery({
    queryKey: ['products', 'home-featured-category', featuredHomeCategory?.id],
    queryFn: () => productApi.getList({ category_id: featuredHomeCategory?.id, per_page: 8 }),
    enabled: !!featuredHomeCategory
  })
  
  const { data: slides, isLoading: isSlidesLoading } = useQuery({
    queryKey: ['slides'],
    queryFn: slideApi.getList
  })

  const heroSlides = [
    {
      title: 'Nhà thuốc tin cậy của gia đình bạn',
      desc: 'Cam kết 100% thuốc chính hãng, giao hàng siêu tốc trong 2 giờ.',
      bg: 'bg-gradient-to-r from-sky-600 to-sky-400',
      image: 'https://img.freepik.com/free-photo/pharmacist-working-pharmacy_23-2148892589.jpg'
    },
    {
      title: 'Dược sĩ tư vấn chuyên môn 24/7',
      desc: 'Luôn sẵn sàng giải đáp mọi thắc mắc về sức khỏe của bạn.',
      bg: 'bg-gradient-to-r from-emerald-600 to-emerald-400',
      image: 'https://img.freepik.com/free-photo/female-pharmacist-holding-pills-bottle-pharmacy_23-2148892591.jpg'
    }
  ]

  return (
    <div className="min-h-screen bg-bg-base">
      {/* 1. Hero Banner - Full Width */}
      {(isSlidesLoading || (slides?.data && slides.data.length > 0)) && (
        <section className="relative overflow-hidden group bg-bg-subtle">
            <div className="overflow-hidden" ref={heroRef}>
              <div className="flex">
                {isSlidesLoading ? (
                  <div className="flex-[0_0_100%] min-w-0 relative aspect-[1/1] md:aspect-[21/9] lg:aspect-[3/1] max-h-[600px] animate-pulse bg-slate-200" />
                ) : (
                  slides.data.map((slide: any, i: number) => (
                    <div 
                      key={slide.id} 
                      className="flex-[0_0_100%] min-w-0 relative aspect-[1/1] md:aspect-[21/9] lg:aspect-[3/1] max-h-[600px] cursor-pointer overflow-hidden"
                      onClick={() => slide.link && (slide.link.startsWith('http') ? window.open(slide.link, '_blank') : navigate(slide.link))}
                    >
                      <img 
                        src={slide.image_url} 
                        alt={slide.title || ''}                        
                        className="absolute inset-0 object-cover object-center w-full h-full" 
                      />
                      {slide.title && (
                        <div className="absolute inset-0 items-center hidden bg-gradient-to-t from-black/60 via-transparent to-transparent md:flex md:items-end">
                          <div className="container relative z-10 max-w-screen-xl px-6 pb-8 mx-auto text-white md:px-16 md:pb-20">
                            <div className="max-w-2xl space-y-4 text-center duration-1000 md:space-y-6 animate-in fade-in slide-in-from-bottom-10 md:text-left">
                               {/* Simple Badge */}
                               <div className="inline-flex items-center gap-2 bg-[var(--primary)] px-3 py-1 rounded-md shadow-lg mx-auto md:mx-0">
                                 <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">PharmaVN Official</span>
                               </div>

                               <h2 className="hidden md:block text-2xl md:text-5xl lg:text-6xl font-black leading-tight text-white drop-shadow-2xl [text-shadow:_2px_2px_0_rgb(0,0,0,0.5),-1px_-1px_0_rgb(0,0,0,0.5),1px_-1px_0_rgb(0,0,0,0.5),-1px_1px_0_rgb(0,0,0,0.5),1px_1px_0_rgb(0,0,0,0.5)]">
                                 {slide.title}
                               </h2>
                               
                               {slide.description && (
                                 <p className="hidden max-w-xl text-xs font-medium leading-relaxed md:block md:text-base text-white/90 drop-shadow-lg line-clamp-2">
                                   {slide.description}
                                 </p>
                               )}
                               
                               <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row md:items-start md:gap-6 md:justify-start">
                                 <button className="group flex items-center gap-3 bg-white text-[var(--primary)] px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm md:text-base hover:bg-[var(--primary)] hover:text-white transition-all duration-300 shadow-2xl">
                                   <span>Xem chi tiết</span>
                                   <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                 </button>
                                 
                                 <div className="flex-col justify-center hidden pl-6 text-left border-l md:flex border-white/30">
                                   <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold">Cam kết</span>
                                   <span className="text-sm font-bold text-white">Sản phẩm chính hãng 100%</span>
                                 </div>
                               </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Carousel Indicators */}
            {!isSlidesLoading && slides?.data.length > 1 && (
              <div className="absolute z-20 flex gap-3 -translate-x-1/2 bottom-6 left-1/2">
                {slides.data.map((_: any, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => heroEmbla?.scrollTo(i)}
                    className={cn(
                      'w-3 h-3 rounded-full transition-all duration-300 border border-white/50 shadow-sm',
                      heroIndex === i ? 'bg-white w-10' : 'bg-white/30'
                    )}
                  />
                ))}
              </div>
            )}
        </section>
      )}

      <PageWrapper>
        {/* 2. Why Choose Us */}
        <Reveal>
          <section className="mb-12">
            <div className="max-w-2xl px-4 mx-auto mb-8 text-center md:mb-10">
              <h2 className="mb-3 text-2xl font-black md:text-3xl text-text-primary">Tại sao chọn PharmaVN?</h2>
              <p className="text-sm font-medium leading-relaxed text-text-muted">Chúng tôi cam kết mang lại trải nghiệm mua sắm dược phẩm an toàn, tiện lợi và chuyên nghiệp nhất cho bạn và gia đình.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { 
                  icon: <ShieldCheck size={36} />, 
                  title: 'Chính hãng 100%', 
                  desc: 'Mọi sản phẩm đều có nguồn gốc rõ ràng, đạt chuẩn GPP của Bộ Y Tế.', 
                  color: 'bg-emerald-50 text-emerald-600',
                  shadow: 'hover:shadow-emerald-500/10'
                },
                { 
                  icon: <Zap size={36} />, 
                  title: 'Giao nhanh 2H', 
                  desc: 'Hệ thống cửa hàng rộng khắp giúp tối ưu thời gian giao hàng đến bạn.', 
                  color: 'bg-sky-50 text-sky-600',
                  shadow: 'hover:shadow-sky-500/10'
                },
                { 
                  icon: <Headphones size={36} />, 
                  title: 'Tư vấn chuyên môn', 
                  desc: 'Đội ngũ dược sĩ 100% có bằng cấp chuyên môn, tư vấn tận tâm 24/7.', 
                  color: 'bg-amber-50 text-amber-600',
                  shadow: 'hover:shadow-amber-500/10'
                },
                { 
                  icon: <RefreshCw size={36} />, 
                  title: 'Đổi trả dễ dàng', 
                  desc: 'Chính sách đổi trả linh hoạt trong vòng 30 ngày giúp bạn an tâm mua sắm.', 
                  color: 'bg-rose-50 text-rose-600',
                  shadow: 'hover:shadow-rose-500/10'
                }
              ].map((item, i) => (
                <div key={i} className={cn(
                  "bg-white border border-border rounded-[32px] p-6 md:p-8 text-center space-y-4 md:space-y-5 transition-all duration-300 hover:-translate-y-2 group",
                  item.shadow
                )}>
                  <div className={cn('w-16 h-16 md:w-20 md:h-20 mx-auto rounded-[24px] flex items-center justify-center transition-transform duration-500 group-hover:rotate-6', item.color)}>
                    {item.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-text-primary">{item.title}</h3>
                    <p className="text-xs font-medium leading-relaxed text-text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* 3. Featured Categories - Dynamic based on Admin selection */}
        {isCatsLoading ? (
          <Reveal delay={0.1}>
            <section className="mb-12">
              <div className="w-48 h-10 mb-8 bg-bg-subtle rounded-xl animate-pulse" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border aspect-square rounded-2xl animate-pulse border-border" />
                ))}
              </div>
            </section>
          </Reveal>
        ) : (
          categories?.data
            .filter(cat => !cat.parent_id && cat.is_featured)
            .map((parent) => (
              <FeaturedCategorySection 
                key={parent.id} 
                parent={parent} 
                allCategories={categories.data} 
                navigate={navigate} 
              />
            ))
        )}

        {/* 4. Best Sellers */}
        <Reveal>
          <section className="mb-12 bg-white border border-border rounded-[32px] p-6 md:p-10 shadow-2xl shadow-sky-500/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 -mt-32 -mr-32 rounded-full bg-primary/5" />
            
            <div className="relative z-10 flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                {/* <div className="flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-500 rounded-2xl">
                  <Flame size={24} strokeWidth={3} />
                </div> */}
                <div>
                  <h2 className="text-2xl font-black text-text-primary">Sản phẩm bán chạy</h2>
                  <p className="text-sm font-medium text-text-muted">Được tin dùng bởi hàng triệu khách hàng</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => bestEmbla?.scrollPrev()} className="flex items-center justify-center w-10 h-10 transition-all rounded-full bg-bg-subtle hover:bg-primary hover:text-white">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => bestEmbla?.scrollNext()} className="flex items-center justify-center w-10 h-10 transition-all rounded-full bg-bg-subtle hover:bg-primary hover:text-white">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-hidden" ref={bestRef}>
              <div className="flex gap-4">
                {isBestLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex-[0_0_100%] sm:flex-[0_0_48%] lg:flex-[0_0_23%] min-w-0"><ProductCardSkeleton /></div>)
                ) : (
                  bestSellers?.data.map(product => (
                    <div key={product.id} className="flex-[0_0_100%] sm:flex-[0_0_48%] lg:flex-[0_0_23%] min-w-0">
                      <ProductCard product={product} />
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </Reveal>

        {/* 5. Promo Banner */}
        <Reveal direction="none">
          <section className="mb-12">
            <div className="relative flex flex-col items-center justify-between gap-8 p-6 overflow-hidden shadow-xl bg-gradient-to-r from-sky-600 to-emerald-500 rounded-3xl md:p-10 md:flex-row group shadow-sky-500/20">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="relative z-10 text-center md:text-left">
                <h2 className="mb-4 text-3xl font-black leading-tight text-white md:text-4xl">Giảm đến 30% các sản phẩm<br />Bổ sung Vitamin & Khoáng chất</h2>
                <p className="max-w-md mb-8 font-medium text-white/80">Chương trình áp dụng từ 01/04 đến 30/04/2024. Nâng cao sức đề kháng cho cả gia đình.</p>
                <Button variant="secondary" size="lg" className="border-none text-[#0ea5e9] hover:text-[#0284c7] group-hover:scale-105 transition-transform" onClick={() => navigate('/products?sort=discount')}>Nhận ưu đãi ngay</Button>
              </div>
              {/* <div className="relative z-10 w-full max-w-xs transition-transform duration-700 md:max-w-sm group-hover:scale-110">
                <img 
                  src="https://pharmacity.vn/images/vitamins.png" 
                  alt="Promo" 
                  className="w-full drop-shadow-2xl"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://img.freepik.com/free-vector/vitamin-supplements-concept_23-2148496853.jpg' }}
                />
              </div> */}
            </div>
          </section>
        </Reveal>

        {/* 6. Featured Category Products (Replaced Newest Products) */}
        {featuredHomeCategory && (
          <Reveal>
            <section className="mb-12">
              <div className="flex items-end justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black md:text-3xl text-text-primary">{featuredHomeCategory.name}</h2>
                  <p className="text-sm font-medium text-text-muted">Khám phá các sản phẩm {featuredHomeCategory.name.toLowerCase()} được khuyên dùng</p>
                </div>
                <Link to={`/category/${featuredHomeCategory.slug}`} className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                  Xem tất cả <ChevronRight size={16} />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {isCatProductsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
                ) : (
                  categoryProducts?.data.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))
                )}
              </div>
            </section>
          </Reveal>
        )}





        {/* 8. Chatbot CTA */}
        <Reveal>
          <section className="mb-8">
            <div className="flex flex-col items-center gap-8 p-8 border-2 border-dashed bg-sky-50 border-sky-200 rounded-3xl md:flex-row group">
              <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 text-white bg-primary rounded-2xl animate-bounce">
                <Bot size={40} />
              </div>
              <div className="flex-1 space-y-1 text-center md:text-left">
                <h3 className="text-lg font-black md:text-xl text-text-primary">Không biết dùng thuốc gì? Chat với dược sĩ ngay!</h3>
                <p className="text-xs font-medium md:text-sm text-text-secondary">Hỗ trợ tra cứu tương tác thuốc, liều dùng và tư vấn sản phẩm phù hợp hoàn toàn miễn phí.</p>
              </div>
              <Button 
                size="lg" 
                className="shadow-lg bg-primary hover:bg-primary-dark shadow-primary/30"
                onClick={() => window.dispatchEvent(new CustomEvent('open-live-chat'))}
              >
                Chat với dược sĩ
                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </section>
        </Reveal>
      </PageWrapper>
    </div>
  )
}
