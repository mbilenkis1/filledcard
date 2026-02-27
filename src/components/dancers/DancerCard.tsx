import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { StyleBadge } from './StyleBadge'
import { PartnerStatusBadge } from './PartnerStatusBadge'
import { TeacherBadge } from './TeacherBadge'
import { MatchScoreRing } from './MatchScoreRing'
import { formatLocation, calculateAge } from '@/lib/utils'
import type { Dancer, DanceStyle } from '@prisma/client'

type DancerWithStyles = Dancer & { danceStyles: DanceStyle[] }

interface DancerCardProps {
  dancer: DancerWithStyles
  matchScore?: number
  matchReasons?: string[]
  showMatchScore?: boolean
}

export function DancerCard({ dancer, matchScore, matchReasons, showMatchScore }: DancerCardProps) {
  const age = dancer.birthYear ? calculateAge(dancer.birthYear) : null
  const location = formatLocation(dancer.city, dancer.state)
  const topStyles = dancer.danceStyles.slice(0, 3)

  return (
    <Link href={`/dancer/${dancer.id}`} className="block group">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Photo area */}
        <div className="relative h-48 bg-gradient-to-br from-[#0F172A] to-[#1e293b]">
          {dancer.profilePhoto ? (
            <img
              src={dancer.profilePhoto}
              alt={dancer.displayName || `${dancer.firstName} ${dancer.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar
                src={dancer.profilePhoto}
                firstName={dancer.firstName}
                lastName={dancer.lastName}
                size="xl"
              />
            </div>
          )}

          {/* Match score overlay */}
          {showMatchScore && matchScore !== undefined && (
            <div className="absolute top-3 right-3 bg-white/95 rounded-full p-1 shadow-md">
              <MatchScoreRing score={matchScore} size="sm" />
            </div>
          )}

          {/* Partner status badge */}
          <div className="absolute bottom-3 left-3">
            <PartnerStatusBadge status={dancer.partnerStatus} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-[#0F172A] group-hover:text-[#D4AF37] transition-colors">
                {dancer.displayName || `${dancer.firstName} ${dancer.lastName}`}
              </h3>
              <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                {location && (
                  <>
                    <MapPin className="w-3 h-3" />
                    <span>{location}</span>
                  </>
                )}
                {age && location && <span className="mx-1">·</span>}
                {age && <span>Age {age}</span>}
              </div>
            </div>
          </div>

          {/* Teacher badges */}
          {dancer.isTeacher && (
            <div className="mt-2">
              <TeacherBadge openToProAm={dancer.openToProAm} verified={dancer.teacherVerified} />
            </div>
          )}

          {/* Styles */}
          {topStyles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {topStyles.map(style => (
                <StyleBadge key={style.id} style={style.style} level={style.level} />
              ))}
              {dancer.danceStyles.length > 3 && (
                <span className="text-xs text-slate-400 self-center">+{dancer.danceStyles.length - 3}</span>
              )}
            </div>
          )}

          {/* Match reasons */}
          {matchReasons && matchReasons.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500 font-medium mb-1">Why you match:</p>
              <ul className="space-y-0.5">
                {matchReasons.slice(0, 3).map((reason, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1">
                    <span className="text-[#D4AF37] mt-0.5">✓</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
