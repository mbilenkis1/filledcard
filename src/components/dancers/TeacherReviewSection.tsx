'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { format } from 'date-fns'
import type { TeacherReview, Dancer } from '@prisma/client'

type ReviewWithReviewer = TeacherReview & { reviewer: Dancer }

interface TeacherReviewSectionProps {
  reviews: ReviewWithReviewer[]
  teacherId: string
  canReview?: boolean
  currentUserId?: string
}

function StarRating({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          disabled={!interactive}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
          onClick={() => onRate?.(i)}
          onMouseEnter={() => interactive && setHovered(i)}
          onMouseLeave={() => interactive && setHovered(0)}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              i <= (interactive ? hovered || rating : rating)
                ? 'fill-[#D4AF37] text-[#D4AF37]'
                : 'text-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function AverageRating({ reviews }: { reviews: ReviewWithReviewer[] }) {
  if (reviews.length === 0) return null
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="font-display font-bold text-2xl text-[#0F172A]">{avg.toFixed(1)}</span>
      <div>
        <StarRating rating={Math.round(avg)} />
        <p className="text-xs text-slate-500">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  )
}

export function TeacherReviewSection({ reviews, teacherId, canReview, currentUserId }: TeacherReviewSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating || !body.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/teachers/${teacherId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, body }),
      })
      if (res.ok) {
        setSubmitted(true)
        setShowForm(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <AverageRating reviews={reviews} />

      {canReview && !submitted && (
        <div className="mb-6">
          {!showForm ? (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              Write a Review
            </Button>
          ) : (
            <form onSubmit={handleSubmit} className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
              <p className="font-medium text-sm text-slate-700">Your Rating</p>
              <StarRating rating={rating} onRate={setRating} interactive />
              <Textarea
                label="Your Review"
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={4}
                placeholder="Share your experience with this teacher..."
                required
              />
              <div className="flex gap-2">
                <Button type="submit" loading={submitting} size="sm">Submit Review</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </div>
      )}

      {submitted && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          Thank you for your review!
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No reviews yet.</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="p-4 bg-white rounded-xl border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <Avatar
                  src={review.reviewer.profilePhoto}
                  firstName={review.reviewer.firstName}
                  lastName={review.reviewer.lastName}
                  size="sm"
                />
                <div>
                  <p className="font-medium text-sm text-[#0F172A]">
                    {review.reviewer.displayName || `${review.reviewer.firstName} ${review.reviewer.lastName}`}
                  </p>
                  <p className="text-xs text-slate-400">{format(new Date(review.createdAt), 'MMM yyyy')}</p>
                </div>
                <StarRating rating={review.rating} />
                {review.isVerified && (
                  <span className="ml-auto text-xs text-[#D4AF37] font-medium">Verified</span>
                )}
              </div>
              <p className="text-sm text-slate-600">{review.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
