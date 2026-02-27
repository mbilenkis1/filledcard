'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Heart, MessageCircle, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home',     icon: Home },
  { href: '/search',    label: 'Search',   icon: Search },
  { href: '/matches',   label: 'Matches',  icon: Heart },
  { href: '/messages',  label: 'Messages', icon: MessageCircle },
  { href: '/profile/edit', label: 'Profile', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-0',
                active ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_4px_rgba(212,175,55,0.4)]')} />
              <span className="text-[10px] font-medium truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
