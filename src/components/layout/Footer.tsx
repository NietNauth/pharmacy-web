import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Phone, Mail, MapPin, Facebook, Instagram, Youtube, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

export const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 min-w-fit">
              <img src="/logo.png" alt="PharmaVN Logo" className="w-10 h-10 object-contain" />
              <img src="/logo-text.png" alt="PharmaVN" className="h-8 object-contain brightness-0 invert" />
            </Link>
            <p className="text-gray-400 text-base leading-relaxed">
              Nhà thuốc PharmaVN tự hào là hệ thống nhà thuốc hiện đại, tin cậy hàng đầu Việt Nam. Chúng tôi cam kết mang đến sản phẩm chính hãng, tư vấn chuyên nghiệp và dịch vụ tận tâm.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-8 text-white">Về chúng tôi</h4>
            <ul className="space-y-5">
              <li><Link to="/branches" className="text-gray-400 hover:text-primary transition-colors text-[15px] font-medium">Hệ thống nhà thuốc</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-primary transition-colors text-[15px] font-medium">Tuyển dụng dược sĩ</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-primary transition-colors text-[15px] font-medium">Chính sách bảo mật</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-primary transition-colors text-[15px] font-medium">Điều khoản sử dụng</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xl font-bold mb-8 text-white">Hỗ trợ khách hàng</h4>
            <ul className="space-y-5">
              <li><Link to="#" className="text-gray-400 hover:text-primary transition-colors text-[15px] font-medium">Hướng dẫn mua hàng</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-primary transition-colors text-[15px] font-medium">Chính sách đổi trả</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-primary transition-colors text-[15px] font-medium">Tra cứu đơn hàng</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-primary transition-colors text-[15px] font-medium">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-bold mb-8 text-white">Liên hệ</h4>
            <ul className="space-y-6">
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-primary shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Hotline miễn phí 24/7</p>
                  <p className="text-2xl font-black text-primary font-mono leading-none">1800 6868</p>
                </div>
              </li>
              <li className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-primary shrink-0">
                  <Mail size={20} />
                </div>
                <span className="text-gray-400 text-[15px] font-medium">hotro@pharmavn.com</span>
              </li>
              <li className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-primary shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-400 text-sm leading-relaxed">Tìm cửa hàng PharmaVN gần bạn nhất</p>
                  <Link to="/branches" className="inline-flex items-center text-primary font-bold text-sm hover:underline group">
                    Xem hệ thống cửa hàng
                    <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-gray-500 text-sm font-medium">
              © 2026 PharmaVN. Thiết kế bởi NietNauth
            </p>
            <p className="text-gray-600 text-[10px] max-w-md leading-relaxed">
              Địa chỉ: Số 123, Đường Thành Công, Quận Hoàn Kiếm, TP. Hà Nội. Giấy chứng nhận đăng ký kinh doanh số 0102030405 do Sở KH&ĐT Hà Nội cấp lần đầu ngày 01/01/2026.
            </p>
          </div>
          <div className="flex items-center gap-10">
            <img 
              src="https://res.cloudinary.com/df8gei1pd/image/upload/v1778509720/20240706162441-0-BCT_oss8u3.png" 
              alt="Bộ công thương" 
              className="h-8 md:h-10 transition-all drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
            />
            <div className="flex flex-wrap justify-center md:justify-end gap-2">
              {[
                { name: 'COD', style: 'hover:text-emerald-400 hover:border-emerald-400/30 hover:bg-emerald-400/5' },
                { name: 'VNPAY', style: 'hover:text-sky-400 hover:border-sky-400/30 hover:bg-sky-400/5' },
                { name: 'MOMO', style: 'hover:text-pink-400 hover:border-pink-400/30 hover:bg-pink-400/5' },
              ].map(item => (
                <div key={item.name} className={cn(
                  "px-3 py-1.5 bg-gray-900/40 border border-gray-800 rounded-lg text-[10px] font-black text-gray-500 tracking-widest transition-all duration-300 cursor-default shadow-sm",
                  item.style
                )}>
                  {item.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
