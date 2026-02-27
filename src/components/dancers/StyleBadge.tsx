import { cn } from '@/lib/utils'
import { DANCE_STYLES, DANCE_LEVELS, CATEGORY_COLORS } from '@/lib/constants'

interface StyleBadgeProps {
  style: string
  level?: string
  className?: string
}

export function StyleBadge({ style, level, className }: StyleBadgeProps) {
  const styleInfo = DANCE_STYLES[style as keyof typeof DANCE_STYLES]
  const colorClass = CATEGORY_COLORS[styleInfo?.category as keyof typeof CATEGORY_COLORS] || 'bg-slate-100 text-slate-700'
  const levelLabel = level ? DANCE_LEVELS[level as keyof typeof DANCE_LEVELS] : null

  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', colorClass, className)}>
      {styleInfo?.label || style}
      {levelLabel && <span className="opacity-70">· {levelLabel}</span>}
    </span>
  )
}
