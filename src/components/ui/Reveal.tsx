import React, { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/cn'

interface RevealProps {
  children: React.ReactNode
  className?: string
  width?: 'fit-content' | '100%'
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
}

export const Reveal = ({ 
  children, 
  className, 
  width = '100%', 
  delay = 0,
  duration = 0.6,
  direction = 'up',
  distance = 20
}: RevealProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [])

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up': return `translateY(${distance}px)`
        case 'down': return `translateY(-${distance}px)`
        case 'left': return `translateX(${distance}px)`
        case 'right': return `translateX(-${distance}px)`
        default: return 'none'
      }
    }
    return 'none'
  }

  return (
    <div 
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      style={{ width }}
    >
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transform: getTransform(),
          transition: `all ${duration}s cubic-bezier(0.17, 0.55, 0.55, 1) ${delay}s`,
        }}
      >
        {children}
      </div>
    </div>
  )
}
