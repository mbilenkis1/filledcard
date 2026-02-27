'use client'

import { useState } from 'react'
import { MapPin, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface LocationDetectorProps {
  onDetected: (city: string, state: string) => void
}

interface NominatimResult {
  address: {
    city?: string
    town?: string
    village?: string
    county?: string
    state?: string
    country_code?: string
  }
}

export function LocationDetector({ onDetected }: LocationDetectorProps) {
  const [status, setStatus] = useState<'idle' | 'detecting' | 'confirming' | 'done' | 'error'>('idle')
  const [detected, setDetected] = useState<{ city: string; state: string } | null>(null)
  const [error, setError] = useState('')

  const detect = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      setStatus('error')
      return
    }

    setStatus('detecting')

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          )
          const data: NominatimResult = await res.json()
          const city = data.address.city || data.address.town || data.address.village || data.address.county || ''
          const state = data.address.state || ''
          setDetected({ city, state })
          setStatus('confirming')
        } catch {
          setError('Could not determine your location. Please enter it manually.')
          setStatus('error')
        }
      },
      () => {
        setError('Location access was denied. Please enter your location manually.')
        setStatus('error')
      },
      { timeout: 10000 }
    )
  }

  const confirm = () => {
    if (detected) {
      onDetected(detected.city, detected.state)
      setStatus('done')
    }
  }

  if (status === 'done') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="w-4 h-4" />
        Location set: {detected?.city}, {detected?.state}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {status === 'idle' && (
        <Button type="button" variant="outline" size="sm" onClick={detect}>
          <MapPin className="w-4 h-4" />
          Detect my location
        </Button>
      )}

      {status === 'detecting' && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Detecting your location...
        </div>
      )}

      {status === 'confirming' && detected && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700 font-medium">
            We found: {detected.city}, {detected.state}
          </p>
          <p className="text-xs text-blue-500 mt-0.5">Is this correct?</p>
          <div className="flex gap-2 mt-2">
            <Button type="button" size="sm" onClick={confirm}>Yes, use this</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setStatus('idle')}>No, I'll enter manually</Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
