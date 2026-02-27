'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DancerCard } from '@/components/dancers/DancerCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { DANCE_STYLES, DANCE_LEVELS, US_STATES } from '@/lib/constants'

const styleOptions = [
  { value: '', label: 'All styles' },
  ...Object.entries(DANCE_STYLES).map(([k, v]) => ({ value: k, label: v.label })),
]

const levelOptions = [
  { value: '', label: 'All levels' },
  ...Object.entries(DANCE_LEVELS).map(([k, v]) => ({ value: k, label: v })),
]

const stateOptions = [
  { value: '', label: 'All states' },
  ...US_STATES.map(s => ({ value: s, label: s })),
]

const statusOptions = [
  { value: '', label: 'Any status' },
  { value: 'LOOKING', label: 'Looking for Partner' },
  { value: 'OPEN_TO_INQUIRIES', label: 'Open to Inquiries' },
]

interface SearchResult {
  dancers: any[]
  total: number
  page: number
  totalPages: number
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [style, setStyle] = useState(searchParams.get('style') || '')
  const [level, setLevel] = useState(searchParams.get('level') || '')
  const [state, setState] = useState(searchParams.get('state') || '')
  const [partnerStatus, setPartnerStatus] = useState(searchParams.get('status') || '')
  const [teachersOnly, setTeachersOnly] = useState(searchParams.get('teachers') === 'true')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const doSearch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (style) params.set('style', style)
      if (level) params.set('level', level)
      if (state) params.set('state', state)
      if (partnerStatus) params.set('status', partnerStatus)
      if (teachersOnly) params.set('teachers', 'true')
      params.set('page', page.toString())

      const res = await fetch(`/api/search?${params}`)
      const data = await res.json()
      setResults(data)
    } finally {
      setLoading(false)
    }
  }, [query, style, level, state, partnerStatus, teachersOnly, page])

  useEffect(() => {
    doSearch()
  }, [doSearch])

  const clearFilters = () => {
    setQuery('')
    setStyle('')
    setLevel('')
    setState('')
    setPartnerStatus('')
    setTeachersOnly(false)
    setPage(1)
  }

  const hasFilters = query || style || level || state || partnerStatus || teachersOnly

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search header */}
      <div className="bg-white border-b border-slate-100 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-4">Find Dancers</h1>
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1) }}
                placeholder="Search by name, style, location..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:border-[#D4AF37]"
              />
            </div>
            <Button
              variant={showFilters ? 'secondary' : 'outline'}
              size="md"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Select
                label="Style"
                options={styleOptions}
                value={style}
                onChange={e => { setStyle(e.target.value); setPage(1) }}
              />
              <Select
                label="Level"
                options={levelOptions}
                value={level}
                onChange={e => { setLevel(e.target.value); setPage(1) }}
              />
              <Select
                label="State"
                options={stateOptions}
                value={state}
                onChange={e => { setState(e.target.value); setPage(1) }}
              />
              <Select
                label="Partner Status"
                options={statusOptions}
                value={partnerStatus}
                onChange={e => { setPartnerStatus(e.target.value); setPage(1) }}
              />
              <div className="col-span-2 md:col-span-4 flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={teachersOnly}
                    onChange={e => { setTeachersOnly(e.target.checked); setPage(1) }}
                    className="rounded border-slate-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                  />
                  <span className="text-sm font-medium text-slate-700">Show teachers open to Pro-Am only</span>
                </label>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-slate-500">
                    <X className="w-3.5 h-3.5" /> Clear filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 h-64 animate-pulse">
                <div className="h-48 bg-slate-100 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : results?.dancers.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h2 className="font-display text-xl font-bold text-slate-400">No dancers found</h2>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search filters</p>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                {results?.total.toLocaleString()} dancer{results?.total !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results?.dancers.map((dancer: any) => (
                <DancerCard key={dancer.id} dancer={dancer} />
              ))}
            </div>

            {/* Pagination */}
            {results && results.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-slate-500">
                  Page {page} of {results.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === results.totalPages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
