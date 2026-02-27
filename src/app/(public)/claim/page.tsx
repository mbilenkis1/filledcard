'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { StyleBadge } from '@/components/dancers/StyleBadge'
import { formatLocation } from '@/lib/utils'
import { Search, CheckCircle, UserPlus } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

interface FoundDancer {
  id: string
  firstName: string
  lastName: string
  city?: string | null
  state?: string | null
  profilePhoto?: string | null
  danceStyles: Array<{ style: string; level: string }>
  isClaimed: boolean
  ndcaId?: string | null
}

export default function ClaimPage() {
  const { isSignedIn } = useUser()
  const searchParams = useSearchParams()
  const prefilledId = searchParams.get('id')

  const [step, setStep] = useState<'search' | 'found' | 'verify' | 'done'>(prefilledId ? 'found' : 'search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoundDancer[]>([])
  const [selected, setSelected] = useState<FoundDancer | null>(null)
  const [ndcaInput, setNdcaInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&unclaimed=true`)
      const data = await res.json()
      setResults(data.dancers || [])
      setStep('found')
    } finally {
      setLoading(false)
    }
  }

  const selectProfile = (dancer: FoundDancer) => {
    setSelected(dancer)
    setStep('verify')
  }

  const verify = async () => {
    if (!selected) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dancerId: selected.id, ndcaId: ndcaInput }),
      })
      if (res.ok) {
        setStep('done')
      } else {
        const data = await res.json()
        setError(data.error || 'Verification failed. Please check your NDCA ID.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0F172A] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h1 className="font-display text-4xl font-bold text-[#0F172A]">Claim Your Profile</h1>
          <p className="text-slate-500 mt-2">We may have your competition data. Find your profile and take ownership.</p>
        </div>

        {step === 'search' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <p className="text-sm font-medium text-slate-700">Search for your name</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && search()}
                  placeholder="Your full name..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
                />
              </div>
              <Button onClick={search} loading={loading}>Search</Button>
            </div>
            {!isSignedIn && (
              <p className="text-xs text-slate-400">You'll need to be logged in to claim a profile.</p>
            )}
          </div>
        )}

        {step === 'found' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">{results.length} profile{results.length !== 1 ? 's' : ''} found</p>
              <Button variant="ghost" size="sm" onClick={() => setStep('search')}>Search again</Button>
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
                <p>No unclaimed profiles found.</p>
                <p className="text-xs mt-1">You may already have an account or your data hasn't been imported yet.</p>
              </div>
            ) : (
              results.map(dancer => (
                <div key={dancer.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
                  <Avatar src={dancer.profilePhoto} firstName={dancer.firstName} lastName={dancer.lastName} size="md" />
                  <div className="flex-1">
                    <p className="font-semibold text-[#0F172A]">{dancer.firstName} {dancer.lastName}</p>
                    {formatLocation(dancer.city, dancer.state) && (
                      <p className="text-xs text-slate-500">{formatLocation(dancer.city, dancer.state)}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dancer.danceStyles.slice(0, 3).map((s, i) => (
                        <StyleBadge key={i} style={s.style} />
                      ))}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => selectProfile(dancer)}>This is me</Button>
                </div>
              ))
            )}
          </div>
        )}

        {step === 'verify' && selected && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <h2 className="font-display font-semibold text-xl text-[#0F172A]">Verify your identity</h2>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <Avatar src={selected.profilePhoto} firstName={selected.firstName} lastName={selected.lastName} size="sm" />
              <p className="font-medium text-[#0F172A]">{selected.firstName} {selected.lastName}</p>
            </div>
            <p className="text-sm text-slate-600">
              Enter your NDCA member ID to verify you own this profile.
            </p>
            <Input
              label="NDCA Member ID"
              value={ndcaInput}
              onChange={e => setNdcaInput(e.target.value)}
              placeholder="Your NDCA number"
            />
            {selected.ndcaId && (
              <p className="text-xs text-slate-400">
                (Hint: the ID on this profile ends in ...{selected.ndcaId.slice(-3)})
              </p>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={verify} loading={loading}>Claim Profile</Button>
              <Button variant="ghost" onClick={() => setStep('found')}>Back</Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="font-display text-2xl font-bold text-[#0F172A]">Profile Claimed!</h2>
            <p className="text-slate-500">Your profile is now linked to your account. Edit it to fill in any missing details.</p>
            <div className="flex gap-2 justify-center">
              <a href="/profile/edit">
                <Button>Edit Profile</Button>
              </a>
              <a href="/dashboard">
                <Button variant="outline">Go to Dashboard</Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
