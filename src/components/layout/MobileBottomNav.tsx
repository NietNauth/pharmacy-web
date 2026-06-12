import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Grid, MessageCircle, Sparkles, User } from 'lucide-react'
import { cn } from '../../utils/cn'

export const MobileBottomNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-2 pb-safe z-50 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <NavLink 
        to="/" 
        className={({ isActive }) => cn(
          'flex flex-col items-center gap-1 flex-1 py-1 transition-colors relative',
          isActive ? 'text-primary' : 'text-text-muted'
        )}
      >
        {({ isActive }) => (
          <>
            <Home size={22} strokeWidth={isActive ? 3 : 2} />
            <span className="text-[10px] font-bold">Trang chủ</span>
            {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />}
          </>
        )}
      </NavLink>

      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('open-category-drawer'))}
        className="flex flex-col items-center gap-1 flex-1 py-1 text-text-muted"
      >
        <Grid size={22} />
        <span className="text-[10px] font-bold">Danh mục</span>
      </button>

      {/* Chatbot Floating Tab */}
      <div className="flex-1 flex flex-col items-center -mt-8">
        <button 
          className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center border-4 border-white active:scale-90 transition-transform"
          onClick={() => {
            // Trigger live chat widget open
            const event = new CustomEvent('open-live-chat')
            window.dispatchEvent(event)
          }}
        >
          <MessageCircle size={28} fill="currentColor" />
        </button>
        <span className="text-[10px] font-black text-primary mt-1">Chat dược sĩ</span>
      </div>

      <NavLink 
        to="/ai-consultant" 
        className={({ isActive }) => cn(
          'flex flex-col items-center gap-1 flex-1 py-1 transition-colors relative',
          isActive ? 'text-primary' : 'text-text-muted'
        )}
      >
        {({ isActive }) => (
          <>
            <Sparkles size={22} strokeWidth={isActive ? 3 : 2} />
            <span className="text-[10px] font-bold">Tư vấn AI</span>
            {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />}
          </>
        )}
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => cn(
          'flex flex-col items-center gap-1 flex-1 py-1 transition-colors relative',
          isActive ? 'text-primary' : 'text-text-muted'
        )}
      >
        {({ isActive }) => (
          <>
            <User size={22} strokeWidth={isActive ? 3 : 2} />
            <span className="text-[10px] font-bold">Tài khoản</span>
            {isActive && <span className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full" />}
          </>
        )}
      </NavLink>
    </nav>
  )
}
