'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { href: '/search', label: 'Find Dancers' },
  { href: '/teachers', label: 'Teachers' },
]

const authLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/matches', label: 'Matches' },
  { href: '/messages', label: 'Messages' },
  { href: '/competitions', label: 'Competitions' },
]

export function Navbar() {
  const { isSignedIn } = useUser()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#0F172A] rounded-lg flex items-center justify-center">
              <span className="text-[#D4AF37] font-display font-bold text-sm">FC</span>
            </div>
            <span className="font-display font-bold text-[#0F172A] text-lg hidden sm:block">FilledCard</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === link.href ? 'text-[#D4AF37]' : 'text-slate-600 hover:text-[#0F172A]'
                )}
              >
                {link.label}
              </Link>
            ))}
            {isSignedIn && authLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === link.href ? 'text-[#D4AF37]' : 'text-slate-600 hover:text-[#0F172A]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth controls */}
          <div className="hidden md:flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link href="/profile/edit">
                  <Button variant="outline" size="sm">Edit Profile</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="primary" size="sm">Join Free</Button>
                </SignUpButton>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          {[...navLinks, ...(isSignedIn ? authLinks : [])].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-slate-700 hover:text-[#0F172A] py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex gap-2">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link href="/profile/edit" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm">Edit Profile</Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="primary" size="sm">Join Free</Button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
