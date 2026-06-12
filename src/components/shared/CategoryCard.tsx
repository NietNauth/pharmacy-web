import React from 'react'
import { Category } from '../../types'
import { cn } from '../../utils/cn'

interface CategoryCardProps {
  category: Category
  onClick?: () => void
  className?: string
}

export const CategoryCard = ({ category, onClick, className }: CategoryCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex flex-col items-center justify-center p-4 bg-white rounded-2xl cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1',
        className
      )}
    >
      <div className="relative flex items-center justify-center w-20 h-20 mb-3 overflow-hidden transition-colors duration-300 rounded-full bg-sky-50 group-hover:bg-sky-100">
        {category.icon_url ? (
          <img src={category.icon_url} alt={category.name} className="relative z-10 object-contain w-16 h-16" />
        ) : (
          <span className="relative z-10 text-3xl">💊</span>
        )}
      </div>
      <h3 className="flex items-center justify-center h-8 px-1 text-xs font-bold text-center transition-colors text-text-primary group-hover:text-primary line-clamp-2">
        {category.name}
      </h3>
    </div>
  )
}
