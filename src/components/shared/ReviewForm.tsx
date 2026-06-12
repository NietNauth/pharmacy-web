import React, { useState, useRef } from 'react'
import { Star, Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import { productApi } from '../../api/products'
import { toast } from 'react-hot-toast'

interface ReviewFormProps {
  productId: string
  orderItemId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export const ReviewForm = ({ productId, orderItemId, onSuccess, onCancel }: ReviewFormProps) => {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // In a real app, you would upload to server and get URLs
    // For now, let's simulate with local URLs
    const newImages = Array.from(files).map(file => URL.createObjectURL(file))
    setImages([...images, ...newImages])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }

    setLoading(true)
    try {
      await productApi.submitReview(productId, {
        rating,
        title,
        body,
        order_item_id: orderItemId,
        images // Should be actual URLs in production
      })
      toast.success('Cảm ơn bạn đã đánh giá sản phẩm!')
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Gửi đánh giá thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h3 className="text-xl font-black text-text-primary">Đánh giá của bạn</h3>
        <p className="text-sm text-text-muted">Trải nghiệm của bạn sẽ giúp ích cho những người mua sau</p>
      </div>

      {/* Rating Stars */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform active:scale-90"
            >
              <Star
                size={40}
                className={cn(
                  "transition-colors duration-200",
                  (hoverRating || rating) >= star 
                    ? "fill-amber-400 text-amber-400" 
                    : "text-slate-200"
                )}
              />
            </button>
          ))}
        </div>
        <span className="text-sm font-bold text-amber-600">
          {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Kém' : 'Rất kém'}
        </span>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Tiêu đề (không bắt buộc)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tóm tắt trải nghiệm của bạn..."
            className="w-full px-4 py-3 bg-bg-subtle/50 border border-border rounded-xl text-sm outline-none focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Nội dung nhận xét</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Sản phẩm có tốt không? Giao hàng nhanh không?..."
            rows={4}
            className="w-full px-4 py-3 bg-bg-subtle/50 border border-border rounded-xl text-sm outline-none focus:border-primary transition-all resize-none"
            required
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Hình ảnh thực tế</label>
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border shadow-sm group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary hover:border-primary/50 hover:bg-primary-light transition-all"
              >
                <Upload size={20} />
                <span className="text-[10px] font-bold uppercase tracking-tight">Thêm ảnh</span>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="text-[10px] text-text-muted italic px-1">Tối đa 5 hình ảnh (định dạng JPG, PNG)</p>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          Hủy bỏ
        </Button>
        <Button
          type="submit"
          className="flex-1 shadow-xl shadow-primary/20"
          loading={loading}
        >
          Gửi đánh giá
        </Button>
      </div>
    </form>
  )
}
