import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  firstName?: string
  lastName?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-20 h-20 text-lg',
  xl: 'w-32 h-32 text-2xl',
}

export function Avatar({ src, firstName, lastName, size = 'md', className }: AvatarProps) {
  const initials = firstName && lastName ? getInitials(firstName, lastName) : '?'
  return (
    <div className={cn('relative rounded-full overflow-hidden bg-[#0F172A] flex items-center justify-center flex-shrink-0', sizes[size], className)}>
      {src ? (
        <img src={src} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-[#D4AF37]">{initials}</span>
      )}
    </div>
  )
}
