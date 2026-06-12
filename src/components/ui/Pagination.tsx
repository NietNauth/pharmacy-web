import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
}

export const Pagination = ({ currentPage, totalPages, onPageChange, totalItems }: PaginationProps) => {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages = []
    const showMax = 5
    
    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i)
      }
      
      if (currentPage < totalPages - 2) pages.push('...')
      if (!pages.includes(totalPages)) pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-border disabled:opacity-30 hover:bg-bg-subtle transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        {getPages().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 text-text-muted">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={cn(
                  'w-10 h-10 rounded-xl font-medium transition-all',
                  currentPage === page 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'hover:bg-bg-subtle text-text-secondary border border-border'
                )}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-border disabled:opacity-30 hover:bg-bg-subtle transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <p className="text-sm text-text-muted">
        Trang {currentPage}/{totalPages} {totalItems !== undefined && `— Tổng ${totalItems} sản phẩm`}
      </p>
    </div>
  )
}
