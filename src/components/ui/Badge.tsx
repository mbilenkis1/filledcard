import { cn } from '@/lib/utils'
import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'gold' | 'outline' | 'success' | 'error'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    gold: 'bg-[#D4AF37]/10 text-[#A68B2A] border border-[#D4AF37]/30',
    outline: 'border border-slate-200 text-slate-600',
    success: 'bg-green-50 text-green-700',
    error: 'bg-red-50 text-red-600',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
