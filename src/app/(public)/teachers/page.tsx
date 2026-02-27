export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { TeacherBadge } from '@/components/dancers/TeacherBadge'
import { StyleBadge } from '@/components/dancers/StyleBadge'
import { Avatar } from '@/components/ui/Avatar'
import { formatLocation } from '@/lib/utils'
import { TRAVEL_WILLINGNESS_LABELS, DANCE_STYLES } from '@/lib/constants'
import { TeacherFilters } from '@/components/teachers/TeacherFilters'
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import { Suspense } from 'react'

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: { style?: string; state?: string; travel?: string }
}) {
  const where: any = {
    isTeacher: true,
    teacherVerified: true,
  }

  if (searchParams.style) {
    where.danceStyles = { some: { style: searchParams.style } }
  }
  if (searchParams.state) {
    where.studioState = searchParams.state
  }
  if (searchParams.travel) {
    where.travelWillingness = searchParams.travel
  }

  const teachers = await prisma.dancer.findMany({
    where,
    include: {
      danceStyles: true,
      reviewsReceived: true,
    },
    orderBy: { createdAt: 'desc' },
  }).catch(err => {
    console.error('[TeachersPage] DB error:', err)
    return []
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#0F172A] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-2">
            <span className="text-[#D4AF37]">Pro Teachers</span>
          </h1>
          <p className="text-white/60">Find verified professional teachers for private lessons and Pro-Am partnerships</p>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="bg-white border-b border-slate-100 py-4 px-4 h-[57px]" />}>
        <TeacherFilters />
      </Suspense>

      {/* Teacher cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {teachers.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-display text-xl">No teachers found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">{teachers.length} verified teacher{teachers.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teachers.map(teacher => {
                const avgRating = teacher.reviewsReceived.length > 0
                  ? (teacher.reviewsReceived.reduce((s, r) => s + r.rating, 0) / teacher.reviewsReceived.length).toFixed(1)
                  : null
                const location = formatLocation(teacher.studioCity || teacher.city, teacher.studioState || teacher.state)
                const rates = teacher.lessonRates as any

                return (
                  <Link key={teacher.id} href={`/dancer/${teacher.id}`} className="block group">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 p-6">
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={teacher.profilePhoto}
                          firstName={teacher.firstName}
                          lastName={teacher.lastName}
                          size="lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-lg text-[#0F172A] group-hover:text-[#D4AF37] transition-colors">
                            {teacher.displayName || `${teacher.firstName} ${teacher.lastName}`}
                          </h3>

                          {location && (
                            <p className="flex items-center gap-1 text-slate-500 text-sm mt-0.5">
                              <MapPin className="w-3.5 h-3.5" /> {location}
                            </p>
                          )}

                          {avgRating && (
                            <p className="flex items-center gap-1 text-sm mt-1">
                              <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                              <span className="font-semibold text-[#0F172A]">{avgRating}</span>
                              <span className="text-slate-400">({teacher.reviewsReceived.length})</span>
                            </p>
                          )}

                          <TeacherBadge
                            openToProAm={teacher.openToProAm}
                            verified={teacher.teacherVerified}
                            className="mt-2"
                          />
                        </div>
                      </div>

                      {teacher.danceStyles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {teacher.danceStyles.slice(0, 4).map(s => (
                            <StyleBadge key={s.id} style={s.style} />
                          ))}
                        </div>
                      )}

                      <div className="mt-4 pt-4 border-t border-slate-100">
                        {rates?.ratesPublic && rates?.privateLessonPerHour ? (
                          <p className="text-sm font-semibold text-[#0F172A]">
                            From ${rates.privateLessonPerHour}
                            <span className="text-slate-400 font-normal">/hour</span>
                          </p>
                        ) : (
                          <p className="text-sm text-slate-400 italic">Contact for pricing</p>
                        )}

                        {teacher.travelWillingness && (
                          <p className="text-xs text-slate-400 mt-1">
                            Travel: {TRAVEL_WILLINGNESS_LABELS[teacher.travelWillingness as keyof typeof TRAVEL_WILLINGNESS_LABELS]}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
