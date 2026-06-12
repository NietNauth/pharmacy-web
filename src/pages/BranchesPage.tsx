import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Search, Navigation, Building2, ChevronRight, Store, Clock } from 'lucide-react'
import { branchApi } from '../api/branches'
import { Branch } from '../types'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { cn } from '../utils/cn'

export const BranchesPage = () => {
  const navigate = useNavigate()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('Tất cả')

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await branchApi.getList()
        setBranches(res.data.filter(b => b.is_active))
      } catch (error) {
        console.error('Failed to fetch branches:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBranches()
  }, [])

  const cities = ['Tất cả', ...Array.from(new Set(branches.map(b => b.city)))]

  const filteredBranches = branches.filter(branch => {
    const matchesSearch = 
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.district.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCity = selectedCity === 'Tất cả' || branch.city === selectedCity

    return matchesSearch && matchesCity
  })

  const openInGoogleMaps = (branch: Branch) => {
    const address = `${branch.address}, ${branch.district}, ${branch.city}`
    const url = branch.lat && branch.lng 
      ? `https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
    window.open(url, '_blank')
  }

  return (
    <div className="min-h-screen bg-bg-base py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[12px] font-bold mb-4 border border-primary/10">
            <Store size={14} />
            <span>Hệ thống cửa hàng</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-4 tracking-tight leading-tight">
            Tìm nhà thuốc <span className="text-primary">PharmaVN</span> <br className="hidden md:block" /> gần bạn nhất
          </h1>
          <p className="text-text-secondary text-sm md:text-base">
            Với mạng lưới rộng khắp, chúng tôi luôn sẵn sàng phục vụ bạn mọi lúc mọi nơi.
            Hãy tìm chi nhánh gần nhất để được tư vấn trực tiếp từ dược sĩ.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3 rounded-[20px] shadow-lg shadow-primary/5 border border-border">
            <div className="md:col-span-2 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
              <input
                type="text"
                placeholder="Tìm theo tên đường, quận huyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-bg-subtle border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[13px]"
              />
            </div>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2.5 bg-bg-subtle border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-[13px] font-bold text-text-primary appearance-none cursor-pointer"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Branches Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="w-10 h-10 rounded-lg mb-4" />
                <Skeleton className="w-3/4 h-5 mb-2" />
                <Skeleton className="w-full h-3 mb-1" />
                <Skeleton className="w-1/2 h-3 mb-5" />
                <div className="flex gap-2">
                  <Skeleton className="flex-1 h-9 rounded-lg" />
                  <Skeleton className="flex-1 h-9 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredBranches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {filteredBranches.map((branch) => (
              <Card 
                key={branch.id} 
                className="group p-5 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border border-border hover:border-primary/20 flex flex-col relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-primary/5 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Building2 size={20} />
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    Mở cửa
                  </div>
                </div>

                <h3 className="text-lg font-bold text-text-primary mb-3 group-hover:text-primary transition-colors line-clamp-1">
                  {branch.name}
                </h3>

                <div className="space-y-2.5 mb-6 flex-1">
                  <div className="flex items-start gap-2.5 text-text-secondary text-[13px] leading-relaxed">
                    <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{branch.address}, {branch.district}, {branch.city}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-text-secondary text-[13px]">
                    <Phone size={16} className="text-primary shrink-0" />
                    <span className="font-semibold">{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-text-secondary text-[13px]">
                    <Clock size={16} className="text-primary shrink-0" />
                    <span>07:00 - 22:00</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-5 border-t border-border mt-auto">
                  <Button 
                    variant="primary" 
                    icon={<Navigation size={13} />}
                    className="rounded-lg text-[10px] font-black h-9 px-0 justify-center gap-1.5"
                    onClick={() => openInGoogleMaps(branch)}
                  >
                    Chỉ đường
                  </Button>
                  <Button 
                    variant="ghost" 
                    icon={<Phone size={13} />}
                    className="rounded-lg text-[10px] font-black h-9 px-0 justify-center gap-1.5 bg-bg-subtle hover:bg-primary/10 hover:text-primary transition-all border border-transparent"
                    onClick={() => window.location.href = `tel:${branch.phone}`}
                  >
                    Gọi ngay
                  </Button>
                </div>
                
                {/* Subtle Background Accent */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                  <Store size={100} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-[32px] border border-dashed border-border max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-bg-subtle rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-text-muted/30" />
            </div>
            <h3 className="text-xl font-black text-text-primary mb-1">Không tìm thấy chi nhánh</h3>
            <p className="text-text-muted text-sm">Thử tìm kiếm với từ khóa khác hoặc chọn thành phố khác.</p>
            <Button 
              variant="ghost" 
              className="mt-4 text-primary text-sm font-bold"
              onClick={() => {
                setSearchQuery('')
                setSelectedCity('Tất cả')
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}

        {/* Support Banner */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="bg-[#0f172a] rounded-[32px] p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-black mb-3 leading-tight">
                  Bạn cần tư vấn trực tuyến?
                </h2>
                <p className="text-white/60 text-sm md:text-base mb-6 max-w-md">
                  Đội ngũ dược sĩ chuyên môn cao luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn qua chat.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button 
                    variant="primary" 
                    size="md" 
                    className="rounded-xl font-black px-8 h-12 shadow-lg shadow-primary/20"
                    onClick={() => navigate('/ai-consultant')}
                  >
                    Chat với dược sĩ ngay
                  </Button>
                  <div className="flex items-center gap-3 px-5 h-12 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                    <Phone size={18} className="text-primary" />
                    <div className="flex flex-col justify-center">
                      <p className="text-[9px] font-bold uppercase opacity-50 leading-none mb-1">Hotline miễn phí</p>
                      <p className="text-base font-black text-primary leading-none">1800 6868</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex justify-end">
                <div className="w-48 h-48 bg-primary/10 rounded-full flex items-center justify-center backdrop-blur-3xl border border-white/5 relative">
                  <Store size={80} className="text-primary/40" />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-full" />
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
