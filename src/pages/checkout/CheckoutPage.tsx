import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  ChevronRight, 
  Home, 
  Building2, 
  Truck, 
  CircleCheckBig,
  Plus,
  Trash2,
  Pencil,
  Search,
  Navigation,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  X,
  ShoppingBag,
  Ticket,
  Wallet
} from 'lucide-react'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'
import { cartApi } from '../../api/cart'
import { orderApi } from '../../api/orders'
import { branchApi } from '../../api/branches'
import { couponApi } from '../../api/coupon'
import { authApi } from '../../api/auth'
import { formatCurrency } from '../../utils/format'
import { cn } from '../../utils/cn'
import { toast } from 'react-hot-toast'
import { ConfirmModal } from '../../components/ui/ConfirmModal'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const FREE_SHIPPING_THRESHOLD = 500000

// --- Map Sub-Components (Defined outside to prevent re-renders losing focus) ---

const MapPicker = ({ lat, lng, onChange, onAddressFound }: { 
  lat: any, 
  lng: any, 
  onChange: (lat: number, lng: number) => void,
  onAddressFound: (address: string) => void
}) => {
  const map = useMap()
  
  useEffect(() => {
    if (lat && lng) {
      // Ensure map knows its size in the modal
      setTimeout(() => {
        map.invalidateSize()
        map.flyTo([lat, lng], 16, { animate: true })
      }, 100)
    }
  }, [lat, lng, map])

  useMapEvents({
    async click(e) {
      const newLat = e.latlng.lat
      const newLng = e.latlng.lng
      onChange(newLat, newLng)
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`)
        const data = await res.json()
        if (data && data.display_name) {
          onAddressFound(data.display_name)
        }
      } catch (err) {
        console.error('Reverse geocoding error', err)
      }
    },
  })

  return lat && lng ? <Marker position={[lat, lng]} /> : null
}

const AddressSearch = ({ value, onSelect, onChange }: { 
  value: string,
  onSelect: (lat: number, lng: number) => void,
  onChange: (val: string) => void 
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.length > 2 && showSuggestions) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value + ', Việt Nam')}&limit=5`)
          const data = await res.json()
          setSuggestions(data)
        } catch (err) {
          console.error('Suggestions error', err)
        }
      } else {
        setSuggestions([])
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [value, showSuggestions])

  const selectLocation = (lat: number, lng: number, displayName: string) => {
    onSelect(lat, lng)
    onChange(displayName)
    map.flyTo([lat, lng], 16)
    setShowSuggestions(false)
    setSuggestions([])
  }

  const containerRef = React.useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current)
      L.DomEvent.disableScrollPropagation(containerRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute top-4 left-12 right-4 z-[1000]">
      <div className="relative group">
        <div className="flex">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
            placeholder="Tìm vị trí trên bản đồ..."
            className="w-full h-11 pl-4 pr-12 bg-white/90 backdrop-blur-md border-2 border-white shadow-xl rounded-2xl text-sm font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-muted/50"
          />
          <button 
            type="button"
            onClick={() => handleSearch()}
            className="absolute right-2 top-1.5 w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <Search size={16} />
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border-2 border-white shadow-2xl rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectLocation(parseFloat(s.lat), parseFloat(s.lon), s.display_name)}
                className="w-full text-left p-3 hover:bg-primary/10 border-b border-bg-subtle last:border-0 flex items-start gap-3 group/item transition-colors"
              >
                <MapPin size={16} className="text-primary shrink-0 mt-1 opacity-70 group-hover/item:opacity-100 transition-opacity" />
                <span className="text-xs font-bold text-text-secondary leading-snug line-clamp-2">
                  {s.display_name.replace(', Việt Nam', '')}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const LocateControl = ({ onLocate }: { onLocate: (lat: number, lng: number) => void }) => {
  const map = useMap()
  const [locating, setLocating] = useState(false)

  const handleLocate = () => {
    setLocating(true)
    map.locate().on('locationfound', (e) => {
      onLocate(e.latlng.lat, e.latlng.lng)
      map.flyTo(e.latlng, 16)
      setLocating(false)
    }).on('locationerror', () => {
      toast.error('Không thể lấy vị trí hiện tại')
      setLocating(false)
    })
  }

  const containerRef = React.useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className="absolute bottom-6 right-4 z-[1000]">
      <button
        type="button"
        onClick={handleLocate}
        className="w-12 h-12 bg-white text-primary rounded-2xl flex items-center justify-center shadow-2xl hover:bg-primary hover:text-white transition-all group"
      >
        <Navigation size={24} className={cn(locating && "animate-pulse")} />
      </button>
    </div>
  )
}

export const CheckoutPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { cart, clearCart } = useCartStore()
  const { user } = useAuthStore()
  
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [deliveryType, setDeliveryType] = useState<'home' | 'branch'>('home')
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState('')
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard')
  const [paymentMethod, setPaymentMethod] = useState<any>('cod')
  const [note, setNote] = useState('')
  const [recipientName, setRecipientName] = useState(user?.full_name || '')
  const [recipientPhone, setRecipientPhone] = useState(user?.phone || '')
  const [orderCode, setOrderCode] = useState('')
  const [finalTotal, setFinalTotal] = useState(0)
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string, discount_amount: number } | null>(null)
  const [showAddressListModal, setShowAddressListModal] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [showConfirmOrderModal, setShowConfirmOrderModal] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: '',
    recipient_name: '',
    recipient_phone: '',
    address_line: '',
    district: '',
    city: '',
    lat: null as any,
    lng: null as any,
    is_default: false
  })

  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('')
  const [mapQuery, setMapQuery] = useState('')

  // Lock body scroll when modals are open
  useEffect(() => {
    if (showAddressModal || showAddressListModal || addressToDeleteId) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showAddressModal, showAddressListModal, addressToDeleteId])

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  // Fetch Provinces
  useEffect(() => {
    if (showAddressModal) {
      fetch('https://provinces.open-api.vn/api/p/')
        .then(res => res.json())
        .then(data => setProvinces(data))
    }
  }, [showAddressModal])

  // Fetch Districts when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvinceCode}?depth=2`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data.districts)
          // Only update city if we're NOT in edit mode to avoid overwriting existing data
          if (!editingAddressId) {
            setNewAddress(prev => ({ ...prev, city: data.name }))
          }
        })
    } else {
      setDistricts([])
    }
  }, [selectedProvinceCode])

  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: authApi.getAddresses,
    enabled: currentStep === 1 && deliveryType === 'home'
  })

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: branchApi.getList,
    enabled: currentStep === 1
  })

  const placeOrderMutation = useMutation({
    mutationFn: (data: any) => orderApi.placeOrder(data),
    onSuccess: (res: any) => {
      // If VNPay payment URL is provided, redirect to it
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url
        return
      }

      // Normal flow (COD or after redirection)
      const orderData = res.data.order
      setOrderCode(orderData.order_code)
      setFinalTotal(orderData.total)
      setCurrentStep(3)
      clearCart()
      setAppliedCoupon(null)
      setShowConfirmOrderModal(false)
      toast.success('Đặt hàng thành công!')
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  const checkCouponMutation = useMutation({
    mutationFn: (code: string) => couponApi.check(code, subtotal),
    onSuccess: (res) => {
      setAppliedCoupon({
        code: res.data.code,
        discount_amount: res.data.discount_amount
      })
      toast.success('Áp dụng mã giảm giá thành công!')
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return
    checkCouponMutation.mutate(couponInput.trim())
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
  }

  const addAddressMutation = useMutation({
    mutationFn: (data: any) => authApi.addAddress(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setSelectedAddressId(res.data.id)
      handleCloseModal()
      toast.success('Đã thêm địa chỉ mới')
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  const updateAddressMutation = useMutation({
    mutationFn: (data: any) => authApi.updateAddress(editingAddressId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      handleCloseModal()
      toast.success('Đã cập nhật địa chỉ')
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      setAddressToDeleteId(null)
      toast.success('Đã xóa địa chỉ')
    },
    onError: (error: any) => {
      toast.error(error.message)
    }
  })

  const handleCloseModal = () => {
    setShowAddressModal(false)
    setEditingAddressId(null)
    setNewAddress({ label: '', recipient_name: '', recipient_phone: '', address_line: '', district: '', city: '', lat: null, lng: null, is_default: false })
    setSelectedProvinceCode('')
    setMapQuery('')
  }

  const handleEditAddress = (addr: any) => {
    setNewAddress({
      label: addr.label,
      recipient_name: addr.recipient_name,
      recipient_phone: addr.recipient_phone,
      address_line: addr.address_line,
      district: addr.district,
      city: addr.city,
      lat: addr.lat,
      lng: addr.lng,
      is_default: addr.is_default
    })
    setEditingAddressId(addr.id)
    setMapQuery(`${addr.address_line}, ${addr.district}, ${addr.city}`)
    // Find province code by name to pre-fill
    const province = provinces.find(p => p.name === addr.city)
    if (province) {
      setSelectedProvinceCode(province.code)
    }
    setShowAddressModal(true)
  }

  const selectedAddress = addresses?.data.find(a => a.id === selectedAddressId) || addresses?.data.find(a => a.is_default)

  useEffect(() => {
    if (addresses?.data && !selectedAddressId) {
      const defaultAddr = addresses.data.find(a => a.is_default) || addresses.data[0]
      if (defaultAddr) setSelectedAddressId(defaultAddr.id)
    }
  }, [addresses, selectedAddressId])

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAddress.label || !newAddress.address_line || !newAddress.city || !newAddress.recipient_name || !newAddress.recipient_phone) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc')
      return
    }
    
    if (editingAddressId) {
      updateAddressMutation.mutate(newAddress)
    } else {
      addAddressMutation.mutate(newAddress)
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (deliveryType === 'home' && !selectedAddressId) {
        toast.error('Vui lòng chọn địa chỉ giao hàng')
        return
      }
      if (deliveryType === 'branch' && !selectedBranchId) {
        toast.error('Vui lòng chọn chi nhánh nhận hàng')
        return
      }
      setCurrentStep(2)
    }
  }

  const handlePlaceOrder = () => {
    const payload = {
      delivery_type: deliveryType === 'home' ? shippingMethod : 'pickup',
      address_id: deliveryType === 'home' ? selectedAddressId : undefined,
      branch_id: deliveryType === 'branch' ? selectedBranchId : undefined,
      payment_method: paymentMethod,
      note,
      recipient_name: deliveryType === 'branch' ? recipientName : undefined,
      recipient_phone: deliveryType === 'branch' ? recipientPhone : undefined,
      coupon_code: appliedCoupon?.code || undefined,
    }
    placeOrderMutation.mutate(payload)
  }

  const subtotal = cart?.summary?.subtotal || 0

  const { distance, shippingPrices } = React.useMemo(() => {
    const branchList = branches?.data || []
    
    if (deliveryType === 'branch' || !selectedAddress || branchList.length === 0) {
      return { 
        distance: null, 
        shippingPrices: { standard: 20000, express: 50000 } 
      }
    }

    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return { 
        distance: null, 
        shippingPrices: { standard: 0, express: 0 } 
      }
    }

    if (!selectedAddress.lat || !selectedAddress.lng) {
      const hasDistrictMatch = branchList.some((b: any) => b.city === selectedAddress.city && b.district === selectedAddress.district)
      const hasCityMatch = branchList.some((b: any) => b.city === selectedAddress.city)
      
      let standardPrice = 40000
      if (hasDistrictMatch) standardPrice = 20000
      else if (hasCityMatch) standardPrice = 30000

      return { 
        distance: null, 
        shippingPrices: { standard: standardPrice, express: 50000 } 
      }
    }

    let minDistance = Infinity
    let nearestBranch: any = null

    branchList.forEach((branch: any) => {
      if (branch.lat && branch.lng) {
        const dist = calculateDistance(
          parseFloat(selectedAddress.lat), 
          parseFloat(selectedAddress.lng), 
          parseFloat(branch.lat), 
          parseFloat(branch.lng)
        )
        if (dist < minDistance) {
          minDistance = dist
          nearestBranch = branch
        }
      }
    })

    const hasDistrictMatch = branchList.some((b: any) => b.city === selectedAddress.city && b.district === selectedAddress.district)
    const hasCityMatch = branchList.some((b: any) => b.city === selectedAddress.city)

    let standardPrice = 40000
    if (hasDistrictMatch) standardPrice = 20000
    else if (hasCityMatch) standardPrice = 30000

    let expressPrice = 50000
    if (minDistance !== Infinity) {
      if (minDistance < 2) {
        expressPrice = 0
      } else {
        const fee = (minDistance * 5000) + 5000 + 20000
        expressPrice = Math.max(35000, Math.round(fee / 1000) * 1000)
      }
    }

    return { 
      distance: minDistance === Infinity ? null : minDistance, 
      shippingPrices: { standard: standardPrice, express: expressPrice } 
    }
  }, [selectedAddress, branches, deliveryType, subtotal])

  const shippingFee = deliveryType === 'home' && subtotal < FREE_SHIPPING_THRESHOLD 
    ? (shippingMethod === 'standard' ? shippingPrices.standard : shippingPrices.express)
    : 0

  const total = Math.max(subtotal + shippingFee - (appliedCoupon?.discount_amount || 0), 0)

  // Stepper UI
  const Stepper = () => (
    <div className="flex items-center justify-center mb-12">
      {[
        { step: 1, label: 'Giao hàng', icon: <MapPin size={20} /> },
        { step: 2, label: 'Thanh toán', icon: <CreditCard size={20} /> },
        { step: 3, label: 'Hoàn tất', icon: <CheckCircle2 size={20} /> }
      ].map((s, i) => (
        <React.Fragment key={s.step}>
          <div className="flex flex-col items-center relative">
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 shadow-lg',
              (currentStep === s.step && s.step !== 3)
                ? 'bg-primary border-primary text-white scale-110 shadow-primary/30' 
                : (currentStep > s.step || (currentStep === 3 && s.step === 3))
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20' 
                  : 'bg-white border-border text-text-muted'
            )}>
              {(currentStep > s.step || (currentStep === 3 && s.step === 3)) ? <CircleCheckBig size={24} /> : s.icon}
            </div>
            <span className={cn(
              'absolute top-14 text-xs font-black uppercase tracking-widest whitespace-nowrap',
              (currentStep === 3 && s.step === 3) || currentStep > s.step ? 'text-emerald-500' : currentStep === s.step ? 'text-primary' : 'text-text-muted'
            )}>
              {s.label}
            </span>
          </div>
          {i < 2 && (
            <div className={cn(
              'flex-1 h-0.5 mx-2 md:mx-4 rounded-full transition-all duration-1000',
              currentStep > s.step ? 'bg-emerald-500' : 'bg-border'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  if (currentStep === 1 && (!cart || cart.items.length === 0)) {
    return (
      <PageWrapper>
        <div className="text-center py-24">
          <h2 className="text-2xl font-black">Giỏ hàng trống</h2>
          <Button size="lg" onClick={() => navigate('/products')}>Tiếp tục mua sắm</Button>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper maxWidth="5xl">
      <Stepper />

      {currentStep === 3 ? (
        <div className="text-center space-y-6 py-8 animate-in zoom-in-95 duration-700">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-10 animate-pulse" />
            <div className="relative w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
              <CheckCircle2 size={40} strokeWidth={2.5} />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Đặt hàng thành công!</h1>
            <p className="text-sm text-text-secondary font-medium px-4 max-w-lg mx-auto">Cảm ơn bạn đã tin tưởng PharmaVN. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao tới.</p>
          </div>

          <div className="max-w-sm mx-auto bg-white border border-emerald-100 rounded-[32px] p-6 shadow-xl shadow-emerald-500/5">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Mã đơn hàng</span>
                <span className="text-sm font-black text-primary font-mono bg-primary/5 px-3 py-1 rounded-lg">#{orderCode}</span>
              </div>
              <div className="h-px bg-emerald-50" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Tổng thanh toán</span>
                <span className="text-lg font-black text-text-primary font-mono">{formatCurrency(finalTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Trạng thái</span>
                <Badge variant="warning" className="text-[10px] px-3 py-0.5 rounded-lg font-black uppercase">Chờ xác nhận</Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="md" className="px-8 h-12 rounded-xl shadow-lg shadow-primary/10" onClick={() => navigate(`/orders/${orderCode}`)}>
              Xem chi tiết đơn hàng
            </Button>
            <Button variant="secondary" size="md" className="px-8 h-12 rounded-xl" onClick={() => navigate('/')}>
              Tiếp tục mua sắm
            </Button>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                <Card className="p-8">
                  <h3 className="text-xl font-black text-text-primary mb-6 flex items-center gap-3">
                    <Truck className="text-primary" />
                    Phương thức nhận hàng
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {[
                      { id: 'home', label: 'Giao tận nơi', icon: <Home size={24} />, desc: 'Giao đến địa chỉ của bạn' },
                      { id: 'branch', label: 'Nhận tại quầy', icon: <Building2 size={24} />, desc: 'Miễn phí vận chuyển' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setDeliveryType(opt.id as any)}
                        className={cn(
                          'flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all',
                          deliveryType === opt.id 
                            ? 'border-primary bg-primary-light/30 shadow-xl shadow-primary/10' 
                            : 'border-border hover:border-primary/50 hover:bg-bg-subtle'
                        )}
                      >
                        <div className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors',
                          deliveryType === opt.id ? 'bg-primary text-white' : 'bg-bg-subtle text-text-muted'
                        )}>
                          {opt.icon}
                        </div>
                        <div className="text-center">
                          <p className="font-black text-text-primary">{opt.label}</p>
                          <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-1">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {deliveryType === 'home' ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-text-muted uppercase tracking-widest">Địa chỉ giao hàng</h4>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary font-black"
                          onClick={() => setShowAddressListModal(true)}
                        >
                          {selectedAddress ? 'Thay đổi' : 'Chọn địa chỉ'}
                        </Button>
                      </div>

                      {selectedAddress ? (
                        <div 
                          className="flex items-start gap-4 p-6 rounded-[24px] border-2 border-primary bg-primary-light/10 cursor-pointer"
                          onClick={() => setShowAddressListModal(true)}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center flex-shrink-0">
                            <MapPin size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-text-primary text-lg">{selectedAddress.label}</span>
                                {selectedAddress.is_default && <Badge variant="info" className="text-[10px]">Mặc định</Badge>}
                              </div>
                            </div>
                            <p className="text-sm font-bold text-text-primary mt-1">
                              {selectedAddress.recipient_name} {selectedAddress.recipient_phone && `(${selectedAddress.recipient_phone})`}
                            </p>
                            <p className="text-text-secondary leading-relaxed font-medium">
                              {selectedAddress.address_line}, {selectedAddress.district}, {selectedAddress.city}
                            </p>
                          </div>
                          <ChevronRight className="text-primary mt-4" size={20} />
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowAddressListModal(true)}
                          className="w-full p-8 rounded-[32px] border-2 border-dashed border-border hover:border-primary hover:bg-primary-light/5 transition-all text-center group"
                        >
                          <div className="w-12 h-12 bg-bg-subtle group-hover:bg-primary group-hover:text-white rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors">
                            <Plus size={24} />
                          </div>
                          <p className="font-bold text-text-muted group-hover:text-primary transition-colors">Vui lòng chọn địa chỉ giao hàng</p>
                        </button>
                      )}

                      <div className="space-y-4 pt-4">
                        <h4 className="text-sm font-black text-text-muted uppercase tracking-widest">Loại vận chuyển</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[
                            { id: 'standard', label: 'Tiêu chuẩn', price: shippingPrices.standard, desc: 'Từ 2-3 ngày làm việc' },
                            { id: 'express', label: 'Hỏa tốc 2H', price: shippingPrices.express, desc: 'Nhận hàng ngay hôm nay' }
                          ].map(opt => (
                            <label 
                              key={opt.id}
                              className={cn(
                                'group relative flex items-center justify-between p-5 rounded-[24px] border-2 cursor-pointer transition-all duration-300',
                                shippingMethod === opt.id 
                                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' 
                                  : 'border-bg-subtle hover:border-primary/30 hover:bg-white'
                              )}
                            >
                              <div className="flex items-start gap-4">
                                <div className={cn(
                                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1 shrink-0',
                                  shippingMethod === opt.id ? 'border-primary' : 'border-border'
                                )}>
                                  {shippingMethod === opt.id && <div className="w-3 h-3 rounded-full bg-primary" />}
                                  <input 
                                    type="radio" 
                                    className="hidden" 
                                    checked={shippingMethod === opt.id}
                                    onChange={() => setShippingMethod(opt.id as any)}
                                  />
                                </div>
                                
                                <div className="flex-1">
                                  <p className="text-sm font-black text-text-primary tracking-tight">{opt.label}</p>
                                  <p className="text-[11px] text-text-muted font-bold mt-0.5">{opt.desc}</p>
                                  
                                  {opt.id === 'express' && (
                                    <div className="mt-2 space-y-1">
                                      <p className="text-[10px] text-emerald-600 font-black">
                                        Miễn phí trong bán kính 2km
                                      </p>
                                    </div>
                                  )}

                                  <div className="mt-3">
                                    {opt.price === 0 ? (
                                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">Freeship</span>
                                    ) : (
                                      <span className="font-black text-primary font-mono text-base">{formatCurrency(opt.price)}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-text-muted uppercase tracking-widest">Thông tin người nhận</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Họ và tên</label>
                            <Input 
                              placeholder="Tên người nhận hàng"
                              value={recipientName}
                              onChange={(e) => setRecipientName(e.target.value)}
                              className="h-12 rounded-2xl"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Số điện thoại</label>
                            <Input 
                              placeholder="Số điện thoại nhận hàng"
                              value={recipientPhone}
                              onChange={(e) => setRecipientPhone(e.target.value)}
                              className="h-12 rounded-2xl"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-border my-6" />

                      <div className="space-y-4">
                        <h4 className="text-sm font-black text-text-muted uppercase tracking-widest">Chọn chi nhánh PharmaVN</h4>
                        <Select 
                          placeholder="Chọn chi nhánh gần bạn nhất..."
                          options={branches?.data.map(b => ({ value: b.id, label: `${b.name} - ${b.address}` })) || []}
                          value={selectedBranchId}
                          onChange={(e) => setSelectedBranchId(e.target.value)}
                        />
                        {selectedBranchId && (
                          <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <Building2 size={20} className="text-primary mt-1" />
                            <div>
                              <p className="text-sm font-bold text-text-primary">{branches?.data.find(b => b.id === selectedBranchId)?.name}</p>
                              <p className="text-xs text-text-secondary mt-1">{branches?.data.find(b => b.id === selectedBranchId)?.address}</p>
                              <p className="text-[10px] text-emerald-600 font-black uppercase mt-2">Giờ mở cửa: 07:00 - 22:00</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="p-8">
                  <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-4">Ghi chú cho người giao hàng</h3>
                  <textarea 
                    className="w-full bg-bg-subtle border border-border rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-primary-light focus:border-primary transition-all resize-none"
                    rows={3}
                    placeholder="Ví dụ: Giao giờ hành chính, để ở bảo vệ..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Card>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <Card className="p-8">
                  <h3 className="text-xl font-black text-text-primary mb-8 flex items-center gap-3">
                    <CreditCard className="text-primary" />
                    Phương thức thanh toán
                  </h3>

                  <div className="space-y-4">
                    {[
                      { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)', desc: 'Thanh toán bằng tiền mặt khi shipper giao tới.', icon: <Wallet size={24} className="text-emerald-500" /> },
                      { id: 'momo', label: 'Ví MoMo', desc: 'Thanh toán qua ví điện tử MoMo.', icon: <img src="https://res.cloudinary.com/df8gei1pd/image/upload/q_auto/f_auto/v1778510315/Mo_Mo_fa21263637_n47ubx.webp" alt="" className="w-10 h-10 object-contain rounded-lg" /> },
                      { id: 'vnpay', label: 'VNPay', desc: 'Thanh toán qua cổng VNPay-QR.', icon: <img src="https://res.cloudinary.com/df8gei1pd/image/upload/q_auto/f_auto/v1778510315/VN_Pay_63fc2a27c5_dqxqqs.webp" alt="" className="w-10 h-10 object-contain rounded-lg" /> }
                    ].map(method => (
                      <label 
                        key={method.id}
                        className={cn(
                          'flex items-center gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all',
                          paymentMethod === method.id ? 'border-primary bg-primary-light/10 shadow-xl shadow-primary/5' : 'border-border hover:bg-bg-subtle'
                        )}
                      >
                        <input 
                          type="radio" 
                          className="w-6 h-6 text-primary" 
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id as any)}
                        />
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-border shadow-sm">
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-black text-text-primary">{method.label}</p>
                          <p className="text-xs text-text-muted font-medium mt-0.5">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6 sticky top-24">
            <Card className="p-6 shadow-2xl shadow-sky-500/5">
              <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-6">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
                {cart?.items ? (
                  cart.items.map(item => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl bg-bg-subtle flex-shrink-0 overflow-hidden border border-border">
                        <img src={item.product.primary_image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-text-primary truncate leading-tight">{item.product.name}</p>
                        <p className="text-xs text-text-muted mt-1 font-bold">SL: {item.quantity}</p>
                        <p className="text-sm font-black text-primary font-mono mt-1">{formatCurrency(item.product.current_price * item.quantity)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-xs text-text-muted">Đang tải giỏ hàng...</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-dashed border-border">
                {appliedCoupon ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between animate-in zoom-in-95">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                        <Ticket size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Mã đã áp dụng</p>
                        <p className="text-sm font-black text-emerald-600">{appliedCoupon.code}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon}
                      className="p-2 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <Input 
                      placeholder="Mã giảm giá..." 
                      className="h-11 rounded-xl text-sm"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <Button 
                      type="submit" 
                      variant="secondary" 
                      className="px-6 h-11 rounded-xl text-sm font-black whitespace-nowrap"
                      loading={checkCouponMutation.isPending}
                    >
                      Áp dụng
                    </Button>
                  </form>
                )}
              </div>

              <div className="h-px bg-border my-6" />

              <div className="space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-text-secondary">Tạm tính</span>
                  <span className="text-text-primary font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium gap-4">
                  <span className="text-text-secondary whitespace-nowrap">Phí vận chuyển</span>
                  <div className="text-right">
                    <span className={cn(
                      "font-bold",
                      shippingFee === 0 && subtotal >= FREE_SHIPPING_THRESHOLD ? "text-emerald-500" : "text-text-primary"
                    )}>
                      {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
                    </span>
                    {distance !== null && (
                      <p className="text-[10px] text-primary font-black uppercase tracking-tighter mt-0.5">
                        Khoảng cách: {distance.toFixed(1)} km
                      </p>
                    )}
                    {subtotal < FREE_SHIPPING_THRESHOLD && deliveryType === 'home' && (
                      <p className="text-[10px] text-text-muted mt-0.5">
                        Mua thêm {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} để được Freeship
                      </p>
                    )}
                  </div>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-sm font-medium animate-in slide-in-from-top-2">
                    <span className="text-text-secondary">Giảm giá</span>
                    <span className="text-emerald-500 font-bold">-{formatCurrency(appliedCoupon.discount_amount)}</span>
                  </div>
                )}
                <div className="h-px bg-border my-4" />
                <div className="flex justify-between items-center mb-8">
                  <span className="text-lg font-black text-text-primary">Tổng tiền</span>
                  <span className="text-2xl font-black text-primary font-mono">{formatCurrency(total)}</span>
                </div>

                <div className="space-y-2">
                  {currentStep === 1 ? (
                    <>
                      <Button 
                        fullWidth 
                        size="lg" 
                        className="shadow-xl shadow-primary/10 group"
                        onClick={handleNextStep}
                      >
                        Tiếp tục thanh toán
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <Button 
                        fullWidth 
                        variant="ghost" 
                        size="sm"
                        className="font-bold text-xs text-text-muted hover:text-primary transition-colors"
                        onClick={() => navigate('/cart')}
                      >
                        <ArrowLeft size={14} className="mr-2" />
                        Quay lại giỏ hàng
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        fullWidth 
                        size="lg" 
                        className="shadow-xl shadow-primary/10 group"
                        onClick={() => setShowConfirmOrderModal(true)}
                      >
                        Xác nhận đặt hàng
                        <CheckCircle2 size={18} className="ml-2 group-hover:scale-110 transition-transform" />
                      </Button>
                      <Button 
                        fullWidth 
                        variant="ghost" 
                        size="sm"
                        className="font-bold text-xs text-text-muted hover:text-primary transition-colors"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowLeft size={14} className="mr-2" />
                        Thay đổi thông tin giao hàng
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-8 p-4 bg-emerald-50 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={18} className="text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1">Cam kết PharmaVN</p>
                  <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">Sản phẩm chính hãng, đổi trả dễ dàng, bảo mật thông tin 100%.</p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      )}

      {showAddressListModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddressListModal(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-text-primary">Chọn địa chỉ giao hàng</h3>
              <button onClick={() => setShowAddressListModal(false)} className="p-2 hover:bg-bg-subtle rounded-xl transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
              {addresses?.data.map(addr => (
                <div 
                  key={addr.id}
                  onClick={() => {
                    setSelectedAddressId(addr.id)
                    setShowAddressListModal(false)
                  }}
                  className={cn(
                    'flex items-start gap-4 p-5 rounded-3xl border-2 cursor-pointer transition-all group',
                    selectedAddressId === addr.id ? 'border-primary bg-primary-light/10' : 'border-border hover:border-primary/30'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center transition-colors',
                    selectedAddressId === addr.id ? 'bg-primary text-white' : 'bg-bg-subtle text-text-muted group-hover:bg-primary-light group-hover:text-primary'
                  )}>
                    <MapPin size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-text-primary">{addr.label}</span>
                        {addr.is_default && <Badge variant="info" className="text-[10px]">Mặc định</Badge>}
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditAddress(addr)
                          }}
                          className="p-1.5 text-primary hover:bg-primary-light rounded-lg transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setAddressToDeleteId(addr.id)
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-text-primary mb-1">
                      {addr.recipient_name} {addr.recipient_phone && `(${addr.recipient_phone})`}
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed font-medium">
                      {addr.address_line}, {addr.district}, {addr.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              fullWidth 
              variant="secondary" 
              className="mt-8 rounded-2xl border-dashed py-6"
              onClick={() => setShowAddressModal(true)}
            >
              <Plus size={20} className="mr-2" />
              Thêm địa chỉ mới
            </Button>
          </div>
        </div>
      )}

      {showAddressModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowAddressModal(false)}
          />
          <div className="relative bg-white w-full max-w-4xl rounded-[40px] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowAddressModal(false)}
              className="absolute right-8 top-8 p-2 text-text-muted hover:text-primary transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-primary-light text-primary rounded-2xl flex items-center justify-center">
                <MapPin size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black text-text-primary">
                  {editingAddressId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                </h2>
                <p className="text-text-muted font-medium">Vui lòng cung cấp thông tin chính xác nhất.</p>
              </div>
            </div>

            <form onSubmit={handleAddAddress} className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Tên người nhận</label>
                      <Input 
                        placeholder="Ví dụ: Anh Tuấn"
                        className="h-12 rounded-2xl"
                        value={newAddress.recipient_name}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, recipient_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Số điện thoại</label>
                      <Input 
                        placeholder="Ví dụ: 0987654321"
                        className="h-12 rounded-2xl"
                        value={newAddress.recipient_phone}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, recipient_phone: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Tên gợi nhớ</label>
                    <Input 
                      placeholder="Ví dụ: Nhà, Công ty..."
                      className="h-12 rounded-2xl"
                      value={newAddress.label}
                      onChange={e => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-text-muted uppercase tracking-widest px-1">Địa chỉ chi tiết</label>
                    <Input 
                      placeholder="Số nhà, tên đường..." 
                      className="h-12 rounded-2xl"
                      value={newAddress.address_line}
                      onChange={e => setNewAddress(prev => ({ ...prev, address_line: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Thành phố</label>
                      <Select 
                        placeholder="Chọn tỉnh thành" 
                        options={provinces.map(p => ({ value: p.code, label: p.name }))}
                        value={selectedProvinceCode}
                        onChange={e => setSelectedProvinceCode(e.target.value)}
                        className="rounded-2xl h-12 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Quận/Huyện</label>
                      <Select 
                        placeholder="Chọn quận huyện" 
                        options={districts.map(d => ({ value: d.name, label: d.name }))}
                        value={newAddress.district}
                        onChange={e => setNewAddress({...newAddress, district: e.target.value})}
                        className="rounded-2xl h-12 text-sm"
                        disabled={!selectedProvinceCode}
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-4 bg-bg-subtle rounded-2xl cursor-pointer hover:bg-primary-light/30 transition-all border border-transparent hover:border-primary/20">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 text-primary rounded-lg border-border" 
                      checked={newAddress.is_default}
                      onChange={e => setNewAddress({...newAddress, is_default: e.target.checked})}
                    />
                    <span className="text-sm font-bold text-text-secondary">Đặt làm địa chỉ mặc định</span>
                  </label>
                </div>

                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest ml-1">Vị trí trên bản đồ (Nhấn để chọn)</label>
                  <div className="flex-1 min-h-[300px] w-full rounded-3xl overflow-hidden border-2 border-bg-subtle relative z-0">
                    <MapContainer 
                      center={[newAddress.lat || 21.0285, newAddress.lng || 105.8542]} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <MapPicker 
                        lat={newAddress.lat} 
                        lng={newAddress.lng} 
                        onChange={(lat, lng) => setNewAddress(prev => ({ ...prev, lat, lng }))} 
                        onAddressFound={(address) => {
                          setMapQuery(address)
                        }}
                      />
                      <AddressSearch 
                        value={mapQuery}
                        onChange={setMapQuery}
                        onSelect={(lat, lng) => setNewAddress(prev => ({ ...prev, lat, lng }))} 
                      />
                      <LocateControl 
                        onLocate={(lat, lng) => {
                          setNewAddress(prev => ({ ...prev, lat, lng }))
                          // Just show the address on map search box, don't update form
                          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                            .then(res => res.json())
                            .then(data => {
                              if (data && data.display_name) setMapQuery(data.display_name)
                            })
                        }} 
                      />
                    </MapContainer>
                  </div>
                  {!newAddress.lat && (
                    <p className="text-[10px] text-primary font-bold italic ml-1">* Vui lòng chọn vị trí trên bản đồ</p>
                  )}
                </div>
              </div>

              <div className="pt-8 flex gap-4 max-w-md mx-auto">
                <Button 
                  type="button" 
                  variant="secondary" 
                  fullWidth 
                  size="lg" 
                  onClick={() => setShowAddressModal(false)}
                  className="rounded-2xl"
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="submit" 
                  fullWidth 
                  size="lg" 
                  loading={addAddressMutation.isPending || updateAddressMutation.isPending}
                  className="rounded-2xl shadow-xl shadow-primary/20"
                >
                  {editingAddressId ? 'Cập nhật' : 'Lưu địa chỉ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={showConfirmOrderModal}
        onClose={() => setShowConfirmOrderModal(false)}
        onConfirm={() => {
          handlePlaceOrder();
        }}
        title="Xác nhận đặt hàng?"
        description={
          <div className="space-y-2">
            <p>Bạn có chắc chắn muốn đặt đơn hàng này không?</p>
            <div className="p-4 bg-bg-subtle rounded-2xl border border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-secondary">Tổng thanh toán:</span>
                <span className="text-lg font-black text-primary font-mono">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-text-muted">Phương thức:</span>
                <span className="font-bold text-text-primary uppercase">{paymentMethod === 'cod' ? 'Tiền mặt (COD)' : paymentMethod}</span>
              </div>
            </div>
          </div>
        }
        confirmText="Đồng ý đặt hàng"
        cancelText="Để tôi xem lại"
        variant="primary"
        loading={placeOrderMutation.isPending}
        icon={<ShoppingBag size={32} strokeWidth={2.5} />}
      />

      <ConfirmModal 
        isOpen={addressToDeleteId !== null}
        onClose={() => setAddressToDeleteId(null)}
        onConfirm={() => addressToDeleteId && deleteAddressMutation.mutate(addressToDeleteId)}
        title="Xác nhận xóa?"
        description={
          <>Bạn có chắc chắn muốn xóa địa chỉ <span className="font-bold text-text-primary">"{addresses?.data.find(a => a.id === addressToDeleteId)?.label}"</span> không? Hành động này không thể hoàn tác.</>
        }
        confirmText="Xác nhận xóa"
        cancelText="Hủy"
        variant="danger"
        loading={deleteAddressMutation.isPending}
        icon={<Trash2 size={32} strokeWidth={2.5} />}
      />
    </PageWrapper>
  )
}
