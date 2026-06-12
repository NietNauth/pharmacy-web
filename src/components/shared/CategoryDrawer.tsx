import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, LayoutGrid, ChevronRight, ArrowLeft } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '../../utils/cn'
import { categoryApi } from '../../api/categories'
import { Category } from '../../types'

interface CategoryDrawerProps {
  open: boolean
  onClose: () => void
}

export const CategoryDrawer = ({ open, onClose }: CategoryDrawerProps) => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [activeParent, setActiveParent] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      setLoading(true)
      categoryApi.getList()
        .then(res => setCategories(res.data))
        .finally(() => setLoading(false))
    } else {
      document.body.style.overflow = ''
      setActiveParent(null)
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const parentCategories = categories.filter(c => !c.parent_id)
  const childCategories = activeParent 
    ? categories.filter(c => c.parent_id === activeParent.id)
    : []

  const handleCategoryClick = (cat: Category) => {
    const children = categories.filter(c => c.parent_id === cat.id)
    if (children.length > 0) {
      setActiveParent(cat)
    } else {
      navigate(`/category/${cat.slug}`)
      onClose()
    }
  }

  const handleChildClick = (child: Category) => {
    if (activeParent) {
      navigate(`/category/${activeParent.slug}/${child.slug}`)
    } else {
      navigate(`/category/${child.slug}`)
    }
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-start">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-text-primary/20 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div className={cn(
        'relative w-[85%] max-w-sm bg-white shadow-2xl h-full flex flex-col transition-transform duration-300 animate-in slide-in-from-left-full',
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {activeParent ? (
              <button 
                onClick={() => setActiveParent(null)}
                className="w-10 h-10 bg-bg-subtle text-text-primary rounded-xl flex items-center justify-center hover:bg-primary-light hover:text-primary transition-all"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <div className="w-10 h-10 bg-primary-light text-primary rounded-xl flex items-center justify-center">
                <LayoutGrid size={20} />
              </div>
            )}
            <div>
              <h2 className="text-lg font-black text-text-primary">
                {activeParent ? activeParent.name : 'Danh mục'}
              </h2>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">
                {activeParent ? 'Khám phá sản phẩm' : 'Tất cả nhóm thuốc'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-bg-subtle text-text-muted transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-14 bg-bg-subtle rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {activeParent ? (
                <>
                  <button
                    onClick={() => handleCategoryClick(activeParent)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-primary/5 text-primary font-bold text-sm border border-primary/10 mb-4"
                  >
                    Xem tất cả {activeParent.name}
                    <ChevronRight size={18} />
                  </button>
                  <div className="grid grid-cols-1 gap-1">
                    {childCategories.map(child => (
                      <button
                        key={child.id}
                        onClick={() => handleChildClick(child)}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-bg-subtle transition-all text-left group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-bg-base flex items-center justify-center group-hover:bg-white shadow-sm transition-all">
                          {child.icon_url ? (
                            <img src={child.icon_url} alt="" className="w-6 h-6 object-contain" />
                          ) : (
                            <LayoutGrid size={18} className="text-text-muted" />
                          )}
                        </div>
                        <span className="text-sm font-bold text-text-primary flex-1">{child.name}</span>
                        <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                parentCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-bg-subtle transition-all text-left group border border-transparent hover:border-border"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-bg-base flex items-center justify-center group-hover:bg-white shadow-sm transition-all">
                      {cat.icon_url ? (
                        <img src={cat.icon_url} alt="" className="w-7 h-7 object-contain" />
                      ) : (
                        <LayoutGrid size={22} className="text-text-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-black text-text-primary leading-tight">{cat.name}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase mt-0.5">
                        {categories.filter(c => c.parent_id === cat.id).length} danh mục con
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!activeParent && (
          <div className="p-6 bg-bg-subtle/50 border-t border-border mt-auto">
            <button 
              onClick={() => { navigate('/products'); onClose(); }}
              className="w-full py-4 bg-white border border-border rounded-2xl text-sm font-black text-text-primary hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm mb-3"
            >
              Xem tất cả sản phẩm
            </button>
            <button 
              onClick={() => { navigate('/branches'); onClose(); }}
              className="w-full py-4 bg-primary/5 border border-primary/10 rounded-2xl text-sm font-black text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              Hệ thống nhà thuốc
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
