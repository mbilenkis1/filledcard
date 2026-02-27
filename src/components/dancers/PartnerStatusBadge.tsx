'use client'

import { cn } from '@/lib/utils'
import { PARTNER_STATUS_LABELS } from '@/lib/constants'

interface PartnerStatusBadgeProps {
  status: string
  className?: string
}

export function PartnerStatusBadge({ status, className }: PartnerStatusBadgeProps) {
  const label = PARTNER_STATUS_LABELS[status as keyof typeof PARTNER_STATUS_LABELS] || status
  const isLooking = status === 'LOOKING'

  if (isLooking) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border border-[#D4AF37] text-[#A68B2A] bg-[#D4AF37]/10',
          className
        )}
      >
        <span
          className="w-2 h-2 rounded-full bg-[#D4AF37] animate-[pulse_gold_2s_ease-in-out_infinite]"
          style={{
            animation: 'pulse_gold 2s ease-in-out infinite',
            boxShadow: '0 0 0 0 rgba(212, 175, 55, 0.7)',
          }}
        />
        {label}
      </span>
    )
  }

  if (status === 'OPEN_TO_INQUIRIES') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600', className)}>
        <span className="w-2 h-2 rounded-full bg-blue-400" />
        {label}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600', className)}>
      <span className="w-2 h-2 rounded-full bg-slate-400" />
      {label}
    </span>
  )
}
