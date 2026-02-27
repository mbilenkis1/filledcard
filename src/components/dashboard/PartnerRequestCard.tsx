'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

interface PartnerRequestCardProps {
  request: {
    id: string
    message: string | null
    createdAt: string
    fromDancer: {
      id: string
      firstName: string
      lastName: string
      displayName: string | null
      profilePhoto: string | null
    }
  }
}

export function PartnerRequestCard({ request }: PartnerRequestCardProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending')
  const [loading, setLoading] = useState<string | null>(null)

  const respond = async (newStatus: 'ACCEPTED' | 'DECLINED') => {
    setLoading(newStatus)
    try {
      const res = await fetch(`/api/partner-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setStatus(newStatus === 'ACCEPTED' ? 'accepted' : 'declined')
        toast({
          type: newStatus === 'ACCEPTED' ? 'success' : 'info',
          title: newStatus === 'ACCEPTED' ? 'Request accepted!' : 'Request declined',
          description: newStatus === 'ACCEPTED'
            ? `You're now connected with ${request.fromDancer.firstName}.`
            : undefined,
        })
      } else {
        toast({ type: 'error', title: 'Something went wrong', description: 'Please try again.' })
      }
    } finally {
      setLoading(null)
    }
  }

  if (status !== 'pending') {
    return (
      <div className="flex items-center gap-3 opacity-50">
        <Avatar
          src={request.fromDancer.profilePhoto}
          firstName={request.fromDancer.firstName}
          lastName={request.fromDancer.lastName}
          size="sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#0F172A] font-medium truncate">
            {request.fromDancer.displayName || `${request.fromDancer.firstName} ${request.fromDancer.lastName}`}
          </p>
          <p className="text-xs text-slate-400">{status === 'accepted' ? 'Connected ✓' : 'Declined'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <Link href={`/dancer/${request.fromDancer.id}`} className="flex-shrink-0">
        <Avatar
          src={request.fromDancer.profilePhoto}
          firstName={request.fromDancer.firstName}
          lastName={request.fromDancer.lastName}
          size="sm"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/dancer/${request.fromDancer.id}`}>
          <p className="text-sm text-[#0F172A] font-medium hover:text-[#D4AF37] transition-colors truncate">
            {request.fromDancer.displayName || `${request.fromDancer.firstName} ${request.fromDancer.lastName}`}
          </p>
        </Link>
        {request.message && (
          <p className="text-xs text-slate-500 truncate mt-0.5">"{request.message}"</p>
        )}
        <div className="flex gap-1.5 mt-2">
          <Button
            size="sm"
            onClick={() => respond('ACCEPTED')}
            loading={loading === 'ACCEPTED'}
            className="h-7 text-xs px-3"
          >
            <Check className="w-3 h-3" /> Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => respond('DECLINED')}
            loading={loading === 'DECLINED'}
            className="h-7 text-xs px-3"
          >
            <X className="w-3 h-3" /> Decline
          </Button>
        </div>
      </div>
      <span className="text-xs text-[#D4AF37] font-semibold flex-shrink-0">New</span>
    </div>
  )
}
