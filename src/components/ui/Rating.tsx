import React from 'react'
import { Star, StarHalf } from 'lucide-react'
import { cn } from '../../utils/cn'

interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (value: number) => void
  className?: string
}

export const Rating = ({
  value,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  className,
}: RatingProps) => {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null)

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24,
  }

  const renderStar = (index: number) => {
    const starValue = index + 1
    const displayValue = hoverValue !== null ? hoverValue : value
    
    let fillType: 'full' | 'half' | 'none' = 'none'
    if (displayValue >= starValue) {
      fillType = 'full'
    } else if (displayValue > starValue - 1) {
      fillType = 'half'
    }

    return (
      <div
        key={index}
        className={cn(
          'relative text-amber-400',
          interactive && 'cursor-pointer hover:scale-110 transition-transform'
        )}
        onMouseEnter={() => interactive && setHoverValue(starValue)}
        onMouseLeave={() => interactive && setHoverValue(null)}
        onClick={() => interactive && onChange?.(starValue)}
      >
        {fillType === 'half' ? (
          <>
            <Star size={iconSizes[size]} className="text-gray-200" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={iconSizes[size]} fill="currentColor" />
            </div>
          </>
        ) : (
          <Star 
            size={iconSizes[size]} 
            fill={fillType === 'full' ? 'currentColor' : 'none'} 
            className={fillType === 'none' ? 'text-gray-200' : ''}
          />
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }).map((_, i) => renderStar(i))}
    </div>
  )
}
