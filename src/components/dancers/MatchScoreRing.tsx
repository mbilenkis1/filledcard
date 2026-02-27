'use client'

import { cn } from '@/lib/utils'

interface MatchScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { ring: 40, stroke: 3, fontSize: 'text-xs' },
  md: { ring: 56, stroke: 4, fontSize: 'text-sm' },
  lg: { ring: 80, stroke: 5, fontSize: 'text-base' },
}

export function MatchScoreRing({ score, size = 'md', className }: MatchScoreRingProps) {
  const { ring, stroke, fontSize } = sizes[size]
  const radius = (ring - stroke * 2) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference

  const color = score >= 70 ? '#D4AF37' : score >= 50 ? '#3b82f6' : '#94a3b8'

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: ring, height: ring }}>
      <svg width={ring} height={ring} className="-rotate-90">
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={ring / 2}
          cy={ring / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className={cn('absolute font-bold', fontSize)} style={{ color }}>
        {score}
      </span>
    </div>
  )
}
