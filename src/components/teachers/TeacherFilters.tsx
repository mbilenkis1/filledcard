'use client'

import { DANCE_STYLES, TRAVEL_WILLINGNESS_LABELS } from '@/lib/constants'
import { useRouter, useSearchParams } from 'next/navigation'

export function TeacherFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="bg-white border-b border-slate-100 py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <form className="flex flex-wrap gap-3">
          <select
            name="style"
            defaultValue={searchParams.get('style') || ''}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
            onChange={e => handleChange('style', e.target.value)}
          >
            <option value="">All styles</option>
            {Object.entries(DANCE_STYLES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>

          <select
            name="travel"
            defaultValue={searchParams.get('travel') || ''}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
            onChange={e => handleChange('travel', e.target.value)}
          >
            <option value="">Any travel</option>
            {Object.entries(TRAVEL_WILLINGNESS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </form>
      </div>
    </div>
  )
}
