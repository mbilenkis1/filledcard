import { format } from 'date-fns'
import { Trophy, MapPin } from 'lucide-react'
import { StyleBadge } from './StyleBadge'
import type { CompetitionResult } from '@prisma/client'

interface CompetitionTimelineProps {
  results: CompetitionResult[]
}

function PlacementBadge({ placement, total }: { placement?: number | null; total?: number | null }) {
  if (!placement) return null
  const isTop3 = placement <= 3
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${isTop3 ? 'bg-[#D4AF37]/15 text-[#A68B2A]' : 'bg-slate-100 text-slate-600'}`}>
      {isTop3 && <Trophy className="w-3 h-3" />}
      {placement}{total ? `/${total}` : ''}
    </span>
  )
}

export function CompetitionTimeline({ results }: CompetitionTimelineProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm">No competition results yet</p>
      </div>
    )
  }

  const sorted = [...results].sort((a, b) =>
    new Date(b.competitionDate).getTime() - new Date(a.competitionDate).getTime()
  )

  // Group by year
  const byYear: Record<string, CompetitionResult[]> = {}
  sorted.forEach(r => {
    const year = new Date(r.competitionDate).getFullYear().toString()
    if (!byYear[year]) byYear[year] = []
    byYear[year].push(r)
  })

  return (
    <div className="space-y-8">
      {Object.entries(byYear).map(([year, items]) => (
        <div key={year}>
          <h3 className="font-display font-semibold text-[#0F172A] text-lg mb-4">{year}</h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-100" />

            <div className="space-y-4">
              {items.map((result) => (
                <div key={result.id} className="relative pl-10">
                  {/* Dot */}
                  <div className="absolute left-1.5 top-4 w-3 h-3 rounded-full bg-[#D4AF37] border-2 border-white shadow-sm" />

                  <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#0F172A] text-sm">{result.competitionName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {format(new Date(result.competitionDate), 'MMM d, yyyy')}
                        </p>
                        {result.location && (
                          <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {result.location}
                          </p>
                        )}
                      </div>
                      <PlacementBadge placement={result.placement} total={result.totalCompetitors} />
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <StyleBadge style={result.style} level={result.level} />
                      {result.partnerName && (
                        <span className="text-xs text-slate-500">w/ {result.partnerName}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
