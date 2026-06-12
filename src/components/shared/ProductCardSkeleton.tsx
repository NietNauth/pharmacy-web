import React from 'react'
import { Skeleton } from '../ui/Skeleton'

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white border border-border rounded-2xl p-2.5 flex flex-col gap-4">
      <Skeleton variant="rect" className="aspect-square w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-1/4 h-3" />
        <Skeleton variant="text" className="w-full h-4" />
        <Skeleton variant="text" className="w-3/4 h-4" />
        <Skeleton variant="text" className="w-1/2 h-3" />
        <div className="flex items-baseline gap-2 pt-2">
          <Skeleton variant="text" className="w-1/3 h-6" />
          <Skeleton variant="text" className="w-1/4 h-4" />
        </div>
      </div>
    </div>
  )
}
