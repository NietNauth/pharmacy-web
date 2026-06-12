import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  User, 
  MapPin, 
  Home,
  FileText, 
  Lock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Camera, 
  Mail, 
  Phone,
  Calendar,
  Building2,
  Stethoscope,
  ChevronRight,
  Upload,
  AlertCircle,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  Package
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { PageWrapper } from '../../components/layout/PageWrapper'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { authApi } from '../../api/auth'
import { prescriptionApi } from '../../api/prescriptions'
import { useAuthStore } from '../../stores/authStore'
import { formatDate, getPrescriptionStatusLabel } from '../../utils/format'
import { cn } from '../../utils/cn'
import { toast } from 'react-hot-toast'

const profileSchema = z.object({
  full_name: z.string().min(2, 'Họ tên quá ngắn'),
  phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/g, 'Số điện thoại không hợp lệ')
})

const passwordSchema = z.object({
  current_password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
  new_password: z.string().min(8, 'Mật khẩu mới phải từ 8 ký tự'),
  confirm_password: z.string()
}).refine(data => data.new_password === data.confirm_password, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirm_password"]
})

export const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, setAuth } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'prescriptions' | 'password'>('info')
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  
  // Password Visibility State
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Prescription Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [prescForm, setPrescForm] = useState({
    doctor_name: '',
    hospital: '',
    issued_date: '',
    expires_date: ''
  })

  // Profile Form
  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name || '', phone: user?.phone || '' }
  })

  // Password Form
  const {
    register: regPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors }
  } = useForm({
    resolver: zodResolver(passwordSchema)
  })

  const newPasswordValue = watch('new_password', '')
  const confirmPasswordValue = watch('confirm_password', '')
  
  const hasLength = newPasswordValue.length >= 8
  const hasUpperLower = /[A-Z]/.test(newPasswordValue) && /[a-z]/.test(newPasswordValue)
  const hasNumber = /[0-9]/.test(newPasswordValue)
  const isMatching = newPasswordValue === confirmPasswordValue && confirmPasswordValue !== ''

  // Queries
  const { data: addresses } = useQuery({ queryKey: ['addresses'], queryFn: authApi.getAddresses })
  // const { data: prescriptions } = useQuery({ queryKey: ['prescriptions'], queryFn: prescriptionApi.getList })
  const prescriptions = { data: [] } // Fake data to prevent UI break

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: (res) => {
      toast.success('Cập nhật hồ sơ thành công')
      if (res.data) {
        setAuth(res.data, localStorage.getItem('token') || '')
      }
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại')
    }
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => authApi.changePassword({
      current_password: data.current_password,
      new_password: data.new_password,
      new_password_confirmation: data.confirm_password
    }),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công')
      resetPassword()
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể đổi mật khẩu');
    }
  })

  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => authApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Đã xóa địa chỉ')
    }
  })

  const uploadPrescriptionMutation = useMutation({
    mutationFn: (data: FormData) => prescriptionApi.upload(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prescriptions'] })
      setIsPrescriptionModalOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      setPrescForm({ doctor_name: '', hospital: '', issued_date: '', expires_date: '' })
      toast.success('Đã gửi đơn thuốc lên hệ thống')
    },
    onError: (err: any) => {
      toast.error(err.message || 'Không thể tải lên đơn thuốc')
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ảnh quá lớn (tối đa 5MB)')
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handlePrescriptionSubmit = () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn ảnh đơn thuốc')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    if (prescForm.doctor_name) formData.append('doctor_name', prescForm.doctor_name)
    if (prescForm.hospital) formData.append('hospital', prescForm.hospital)
    if (prescForm.issued_date) formData.append('issued_date', prescForm.issued_date)
    if (prescForm.expires_date) formData.append('expires_date', prescForm.expires_date)

    uploadPrescriptionMutation.mutate(formData)
  }

  const tabs = [
    { id: 'info', label: 'Thông tin cá nhân', icon: <User size={20} /> },
    { id: 'orders', label: 'Lịch sử đơn hàng', icon: <Package size={20} /> },
    { id: 'address', label: 'Sổ địa chỉ', icon: <MapPin size={20} /> },
    { id: 'prescriptions', label: 'Đơn thuốc của tôi', icon: <FileText size={20} /> },
    { id: 'password', label: 'Đổi mật khẩu', icon: <Lock size={20} /> }
  ]

  return (
    <PageWrapper maxWidth="5xl">
      <div className="flex flex-col lg:flex-row gap-6 pt-2">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-56 space-y-2">
          <div className="bg-white border border-border rounded-[24px] p-6 text-center mb-4 shadow-sm">
            <div className="relative inline-block mb-3">
              <div className="w-16 h-16 bg-primary-light text-primary text-2xl font-black rounded-[20px] flex items-center justify-center shadow-md border-2 border-white">
                {user?.full_name.charAt(0)}
              </div>
              <button className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform">
                <Camera size={12} />
              </button>
            </div>
            <h2 className="text-lg font-black text-text-primary leading-tight">{user?.full_name}</h2>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">{user?.role === 'customer' ? 'Khách hàng thân thiết' : 'Dược sĩ'}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Badge variant={user?.is_verified ? 'success' : 'warning'} className="text-[9px] px-2 py-0">
                {user?.is_verified ? 'Đã xác thực' : 'Chưa xác thực'}
              </Badge>
            </div>
          </div>

          <div className="bg-white border border-border rounded-[24px] p-1.5 shadow-sm overflow-hidden">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'orders') {
                    navigate('/orders');
                  } else {
                    setActiveTab(tab.id as any);
                  }
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all',
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/10' 
                    : 'text-text-muted hover:bg-bg-subtle hover:text-text-primary'
                )}
              >
                {React.cloneElement(tab.icon as React.ReactElement, { size: 16 })}
                {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <Card className="p-6 md:p-8 shadow-xl shadow-sky-500/5 animate-in fade-in slide-in-from-right-4 duration-500">
            {activeTab === 'info' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black text-text-primary tracking-tight">Hồ sơ cá nhân</h3>
                  <Badge variant="info" className="px-4 py-1">ID: {user?.id.slice(0, 8)}</Badge>
                </div>

                <form onSubmit={handleProfile((data) => updateProfileMutation.mutate(data))} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Họ và tên"
                      placeholder="Nguyễn Văn A"
                      iconLeft={<User size={18} />}
                      error={profileErrors.full_name?.message}
                      {...regProfile('full_name')}
                    />
                    <Input
                      label="Số điện thoại"
                      placeholder="0912345678"
                      iconLeft={<Phone size={18} />}
                      error={profileErrors.phone?.message}
                      {...regProfile('phone')}
                    />
                  </div>

                  <div className="space-y-1.5 opacity-70">
                    <label className="text-sm font-semibold text-text-primary ml-1">Địa chỉ Email</label>
                    <div className="flex items-center gap-3 bg-bg-subtle border border-border rounded-xl px-4 py-2.5">
                      <Mail size={18} className="text-text-muted" />
                      <span className="text-text-secondary text-sm font-medium">{user?.email}</span>
                      <Badge variant="success" className="ml-auto text-[10px]">Cố định</Badge>
                    </div>
                    <p className="text-[10px] text-text-muted italic ml-1">* Không thể thay đổi email đã đăng ký</p>
                  </div>

                  <Button type="submit" size="lg" className="px-12" loading={updateProfileMutation.isPending}>
                    Lưu thay đổi
                  </Button>
                </form>
              </div>
            )}

            {activeTab === 'address' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-text-primary tracking-tight">Sổ địa chỉ</h3>
                  <Button size="sm" onClick={() => setIsAddressModalOpen(true)}>
                    <Plus size={18} className="mr-2" />
                    Thêm địa chỉ mới
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses?.data.map(addr => (
                    <div key={addr.id} className="p-6 bg-white border-2 border-border rounded-3xl hover:border-primary transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-light text-primary rounded-xl flex items-center justify-center">
                            {addr.label === 'Nhà riêng' ? <Home size={20} /> : <Building2 size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary">{addr.label}</p>
                            {addr.is_default && <Badge variant="success" className="text-[10px] mt-1">Mặc định</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => deleteAddressMutation.mutate(addr.id)}
                            className="p-2 text-text-muted hover:text-error hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed mb-4">
                        {addr.address_line}, {addr.district}, {addr.city}
                      </p>
                      {!addr.is_default && (
                        <button className="text-xs font-bold text-primary hover:underline">Đặt làm mặc định</button>
                      )}
                    </div>
                  ))}
                  {(!addresses?.data || addresses.data.length === 0) && (
                    <div className="md:col-span-2 py-12 text-center bg-bg-subtle/50 rounded-[32px] border-2 border-dashed border-border">
                      <MapPin size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
                      <p className="text-text-secondary font-medium">Bạn chưa lưu địa chỉ nào.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'prescriptions' && (
              <div className="py-20 text-center space-y-6">
                <div className="w-24 h-24 bg-primary-light/30 text-primary rounded-[32px] flex items-center justify-center mx-auto animate-pulse">
                  <FileText size={48} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-text-primary tracking-tight">Chức năng đang phát triển</h3>
                  <p className="text-sm text-text-muted max-w-sm mx-auto leading-relaxed">
                    Tính năng gửi đơn thuốc trực tuyến đang được chúng tôi hoàn thiện. Vui lòng quay lại sau hoặc liên hệ hotline để được hỗ trợ.
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setActiveTab('info')}>
                  Quay lại hồ sơ
                </Button>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="space-y-8">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-text-primary tracking-tight">Đổi mật khẩu</h3>
                  <p className="text-xs text-text-muted font-medium">Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác.</p>
                </div>

                <form
                  onSubmit={handlePassword((data) => changePasswordMutation.mutate(data))}
                  className="max-w-md space-y-6"
                >
                  <Input
                    label="Mật khẩu hiện tại"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="••••••••"
                    iconLeft={<Lock size={18} />}
                    iconRight={
                      <button 
                        type="button" 
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="hover:text-primary transition-colors"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                    error={passwordErrors.current_password?.message}
                    {...regPassword('current_password')}
                  />
                  <div className="h-px bg-border" />
                  <Input
                    label="Mật khẩu mới"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    iconLeft={<Lock size={18} />}
                    iconRight={
                      <button 
                        type="button" 
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="hover:text-primary transition-colors"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                    error={passwordErrors.new_password?.message}
                    {...regPassword('new_password')}
                  />
                  <Input
                    label="Xác nhận mật khẩu mới"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    iconLeft={<Lock size={18} />}
                    iconRight={
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                    error={passwordErrors.confirm_password?.message || (!isMatching && confirmPasswordValue !== '' ? "Mật khẩu xác nhận chưa trùng khớp" : "")}
                    {...regPassword('confirm_password')}
                  />

                  <div className="bg-bg-subtle p-4 rounded-2xl border border-border">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Quy định mật khẩu:</h5>
                    <ul className="space-y-1.5">
                      <li className={cn(
                        "text-[10px] font-bold flex items-center gap-2 transition-colors",
                        hasLength ? "text-emerald-500" : "text-text-secondary opacity-50"
                      )}>
                        <CheckCircle2 size={12} className={cn(hasLength ? "fill-emerald-500/10" : "")} /> Tối thiểu 8 ký tự
                      </li>
                      <li className={cn(
                        "text-[10px] font-bold flex items-center gap-2 transition-colors",
                        hasUpperLower ? "text-emerald-500" : "text-text-secondary opacity-50"
                      )}>
                        <CheckCircle2 size={12} className={cn(hasUpperLower ? "fill-emerald-500/10" : "")} /> Bao gồm chữ hoa và chữ thường
                      </li>
                      <li className={cn(
                        "text-[10px] font-bold flex items-center gap-2 transition-colors",
                        hasNumber ? "text-emerald-500" : "text-text-secondary opacity-50"
                      )}>
                        <CheckCircle2 size={12} className={cn(hasNumber ? "fill-emerald-500/10" : "")} /> Bao gồm ít nhất 1 chữ số
                      </li>
                      <li className={cn(
                        "text-[10px] font-bold flex items-center gap-2 transition-colors",
                        isMatching ? "text-emerald-500" : "text-text-secondary opacity-50"
                      )}>
                        <CheckCircle2 size={12} className={cn(isMatching ? "fill-emerald-500/10" : "")} /> Mật khẩu xác nhận trùng khớp
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="px-12 shadow-xl shadow-primary/20"
                    loading={changePasswordMutation.isPending}
                  >
                    Cập nhật mật khẩu
                  </Button>
                </form>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Address Modal */}
      <Modal
        open={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Thêm địa chỉ giao hàng"
        size="md"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center gap-3 p-4 rounded-2xl border-2 border-primary bg-primary-light/10 text-primary">
              <Home size={20} />
              <span className="font-bold text-sm">Nhà riêng</span>
            </button>
            <button className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border text-text-muted hover:border-primary/50 transition-all">
              <Building2 size={20} />
              <span className="font-bold text-sm">Công ty</span>
            </button>
          </div>
          <Input label="Họ tên người nhận" placeholder="Nguyễn Văn A" />
          <Input label="Số điện thoại" placeholder="0912345678" />
          <Input label="Địa chỉ cụ thể" placeholder="Số nhà, tên đường, phường/xã..." />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Quận/Huyện" options={[{ value: 'q1', label: 'Quận 1' }]} />
            <Select label="Tỉnh/Thành phố" options={[{ value: 'hcm', label: 'TP. Hồ Chí Minh' }]} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-primary" />
            <span className="text-sm font-medium text-text-secondary">Đặt làm địa chỉ mặc định</span>
          </label>
          <Button fullWidth size="lg" onClick={() => setIsAddressModalOpen(false)}>Lưu địa chỉ</Button>
        </div>
      </Modal>

      {/* Prescription Modal */}
      <Modal
        open={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        title="Tải đơn thuốc lên hệ thống"
        size="md"
      >
        <div className="space-y-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed border-border rounded-3xl p-6 text-center bg-bg-subtle/30 group hover:border-primary transition-all cursor-pointer overflow-hidden relative",
              selectedFile && "border-primary bg-primary/5"
            )}
          >
            {previewUrl ? (
              <div className="relative group">
                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-xl shadow-sm" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <p className="text-white text-xs font-bold">Thay đổi ảnh</p>
                </div>
              </div>
            ) : (
              <div className="py-6">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-text-muted group-hover:text-primary mb-4 transition-colors">
                  <Plus size={32} />
                </div>
                <p className="text-sm font-bold text-text-primary">Chọn ảnh đơn thuốc</p>
                <p className="text-xs text-text-muted mt-1">Hỗ trợ định dạng JPG, PNG (Tối đa 5MB)</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Tên bác sĩ" 
              placeholder="Bác sĩ điều trị..." 
              value={prescForm.doctor_name}
              onChange={(e) => setPrescForm({...prescForm, doctor_name: e.target.value})}
            />
            <Input 
              label="Bệnh viện/Phòng khám" 
              placeholder="Nơi cấp đơn..." 
              value={prescForm.hospital}
              onChange={(e) => setPrescForm({...prescForm, hospital: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Ngày cấp đơn" 
              type="date" 
              value={prescForm.issued_date}
              onChange={(e) => setPrescForm({...prescForm, issued_date: e.target.value})}
            />
            <Input 
              label="Ngày hết hạn" 
              type="date" 
              value={prescForm.expires_date}
              onChange={(e) => setPrescForm({...prescForm, expires_date: e.target.value})}
            />
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl flex gap-3">
            <AlertCircle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
              Dược sĩ của chúng tôi sẽ kiểm tra tính xác thực của đơn thuốc trong vòng 15-30 phút sau khi bạn gửi.
            </p>
          </div>

          <Button 
            fullWidth 
            size="lg" 
            onClick={handlePrescriptionSubmit}
            loading={uploadPrescriptionMutation.isPending}
          >
            Gửi đơn thuốc
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}
