'use client'

import Link from 'next/link'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUser } from '@clerk/nextjs'

interface ProfileClaimBannerProps {
  dancerId: string
  dancerName: string
}

export function ProfileClaimBanner({ dancerId, dancerName }: ProfileClaimBannerProps) {
  const { isSignedIn } = useUser()

  return (
    <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-lg flex items-center justify-center flex-shrink-0">
        <UserPlus className="w-5 h-5 text-[#D4AF37]" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-[#0F172A] text-sm">Is this you?</p>
        <p className="text-xs text-slate-600 mt-0.5">
          Claim this profile to take ownership, update your information, and fill your dance card.
        </p>
      </div>
      <Link href={isSignedIn ? `/claim?id=${dancerId}` : `/sign-up?redirect=/claim?id=${dancerId}`}>
        <Button variant="primary" size="sm">
          Claim Profile
        </Button>
      </Link>
    </div>
  )
}
