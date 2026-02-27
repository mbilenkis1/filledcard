import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeacherBadgeProps {
  openToProAm?: boolean
  verified?: boolean
  className?: string
}

export function TeacherBadge({ openToProAm, verified, className }: TeacherBadgeProps) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/15 text-[#A68B2A] border border-[#D4AF37]/30">
        <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
        {verified ? 'Verified Teacher' : 'Teacher'}
      </span>
      {openToProAm && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#D4AF37]/10 text-[#A68B2A] border border-[#D4AF37]/20">
          Open to Pro-Am
        </span>
      )}
    </div>
  )
}
