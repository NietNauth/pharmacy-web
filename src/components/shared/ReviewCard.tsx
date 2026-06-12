import React from 'react'
import { ThumbsUp, CheckCircle2 } from 'lucide-react'
import { Review } from '../../types'
import { formatRelativeTime } from '../../utils/format'
import { Rating } from '../ui/Rating'
import { cn } from '../../utils/cn'

interface ReviewCardProps {
  review: Review
  onVote?: (reviewId: string, isHelpful: boolean) => void
}

export const ReviewCard = ({ review, onVote }: ReviewCardProps) => {
  return (
    <div className="py-6 border-b border-border last:border-0 flex gap-4">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
        {review.user.full_name.charAt(0)}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-text-primary">{review.user.full_name}</h4>
            {review.is_verified_purchase && (
              <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <CheckCircle2 size={12} />
                Đã mua hàng
              </div>
            )}
          </div>
          <span className="text-xs text-text-muted">{formatRelativeTime(review.created_at)}</span>
        </div>

        <div className="flex items-center gap-4">
          <Rating value={review.rating} size="sm" />
          {review.title && <h5 className="font-bold text-sm text-text-primary">{review.title}</h5>}
        </div>

        <p className="text-sm text-text-secondary leading-relaxed py-1">
          {review.body}
        </p>

        {review.images && review.images.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {review.images.map((img, i) => (
              <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity">
                <img 
                  src={img.url} 
                  alt="Review" 
                  className="w-full h-full object-cover" 
                />
              </div>
            ))}
          </div>
        )}

        {review.admin_reply && (
          <div className="mt-4 p-4 bg-primary-light/30 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-1.5">
              <CheckCircle2 size={12} />
              PharmaVN Phản hồi
            </div>
            <p className="text-sm text-text-primary italic leading-relaxed">
              {review.admin_reply}
            </p>
          </div>
        )}

        <div className="pt-2">
          <button 
            onClick={() => onVote?.(review.id, true)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-bold transition-all px-3 py-1.5 rounded-full border",
              review.user_voted 
                ? "text-primary border-primary bg-primary-light" 
                : "text-text-muted border-border hover:border-primary/50"
            )}
          >
            <ThumbsUp size={14} className={cn(review.user_voted && "fill-current")} />
            Hữu ích {review.helpful_count > 0 && `(${review.helpful_count})`}
          </button>
        </div>
      </div>
    </div>
  )
}
