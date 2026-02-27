export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { StyleBadge } from '@/components/dancers/StyleBadge'
import { PartnerStatusBadge } from '@/components/dancers/PartnerStatusBadge'
import { TeacherBadge } from '@/components/dancers/TeacherBadge'
import { CompetitionTimeline } from '@/components/dancers/CompetitionTimeline'
import { VideoGallery } from '@/components/dancers/VideoGallery'
import { RateCard } from '@/components/dancers/RateCard'
import { TeacherReviewSection } from '@/components/dancers/TeacherReviewSection'
import { ProfileClaimBanner } from '@/components/dancers/ProfileClaimBanner'
import { formatLocation, calculateAge } from '@/lib/utils'
import { TRAVEL_WILLINGNESS_LABELS, COMPETITION_FREQUENCY_LABELS, BUDGET_RANGE_LABELS } from '@/lib/constants'
import { MapPin, Instagram, Youtube, Building2, GraduationCap, MessageCircle } from 'lucide-react'

export default async function DancerProfilePage({ params }: { params: { id: string } }) {
  const user = await currentUser()

  const dancer = await prisma.dancer.findUnique({
    where: { id: params.id },
    include: {
      danceStyles: true,
      competitionResults: { orderBy: { competitionDate: 'desc' } },
      videos: { orderBy: { addedAt: 'desc' } },
      reviewsReceived: {
        include: { reviewer: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!dancer) notFound()

  // Check if the viewer has a confirmed pro-am partnership with this teacher
  let canReview = false
  let viewerDancerId: string | null = null
  if (user && dancer.isTeacher) {
    const viewerDancer = await prisma.dancer.findUnique({
      where: { clerkUserId: user.id },
    })
    if (viewerDancer) {
      viewerDancerId = viewerDancer.id
      const accepted = await prisma.partnerRequest.findFirst({
        where: {
          fromDancerId: viewerDancer.id,
          toDancerId: dancer.id,
          status: 'ACCEPTED',
        },
      })
      const alreadyReviewed = await prisma.teacherReview.findUnique({
        where: { teacherId_reviewerId: { teacherId: dancer.id, reviewerId: viewerDancer.id } },
      })
      canReview = !!accepted && !alreadyReviewed
    }
  }

  const isOwnProfile = user && dancer.clerkUserId === user.id
  const age = dancer.birthYear ? calculateAge(dancer.birthYear) : null
  const location = formatLocation(dancer.city, dancer.state)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Profile hero */}
      <div className="bg-[#0F172A] text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar
              src={dancer.profilePhoto}
              firstName={dancer.firstName}
              lastName={dancer.lastName}
              size="xl"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3">
                <h1 className="font-display text-4xl font-bold">
                  {dancer.displayName || `${dancer.firstName} ${dancer.lastName}`}
                </h1>
                {dancer.isTeacher && (
                  <TeacherBadge openToProAm={dancer.openToProAm} verified={dancer.teacherVerified} />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-white/60 text-sm">
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {location}
                  </span>
                )}
                {age && <span>Age {age}</span>}
                {dancer.studioName && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> {dancer.studioName}
                  </span>
                )}
                {dancer.coachName && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" /> Coach: {dancer.coachName}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <PartnerStatusBadge status={dancer.partnerStatus} />
                {dancer.danceStyles.slice(0, 4).map(s => (
                  <StyleBadge key={s.id} style={s.style} level={s.level} />
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {dancer.instagramHandle && (
                  <a
                    href={`https://instagram.com/${dancer.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
                  >
                    <Instagram className="w-4 h-4" /> @{dancer.instagramHandle}
                  </a>
                )}
                {dancer.youtubeHandle && (
                  <a
                    href={`https://youtube.com/@${dancer.youtubeHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
                  >
                    <Youtube className="w-4 h-4" /> {dancer.youtubeHandle}
                  </a>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 sm:items-end">
              {isOwnProfile ? (
                <a href="/profile/edit">
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">Edit Profile</Button>
                </a>
              ) : (
                <>
                  <a href={`/messages?to=${dancer.id}`}>
                    <Button variant="primary">
                      <MessageCircle className="w-4 h-4" /> Connect
                    </Button>
                  </a>
                  {dancer.isTeacher && dancer.openToProAm && (
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      Request Pro-Am Partnership
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Claim banner */}
        {!dancer.isClaimed && !isOwnProfile && (
          <ProfileClaimBanner
            dancerId={dancer.id}
            dancerName={dancer.displayName || `${dancer.firstName} ${dancer.lastName}`}
          />
        )}

        {/* Bio */}
        {dancer.bio && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-display font-semibold text-xl text-[#0F172A] mb-3">About</h2>
            <p className="text-slate-600 leading-relaxed">{dancer.bio}</p>
          </div>
        )}

        {/* Dance styles */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-display font-semibold text-xl text-[#0F172A] mb-4">Dance Styles</h2>
          {dancer.danceStyles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dancer.danceStyles.map(style => (
                <div key={style.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <StyleBadge style={style.style} level={style.level} />
                  <div className="flex gap-2 text-xs text-slate-500">
                    {style.isCompeting && <span className="text-green-600 font-medium">Competing</span>}
                    {style.wantsToCompete && !style.isCompeting && <span className="text-blue-600 font-medium">Wants to compete</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No dance styles listed yet.</p>
          )}
        </div>

        {/* Dancing details */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-display font-semibold text-xl text-[#0F172A] mb-4">Details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {dancer.competitionFrequency && (
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-400 mb-1">Competes</p>
                <p className="text-sm font-semibold text-[#0F172A]">{COMPETITION_FREQUENCY_LABELS[dancer.competitionFrequency as keyof typeof COMPETITION_FREQUENCY_LABELS]}</p>
              </div>
            )}
            {dancer.budgetRange && (
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-400 mb-1">Budget</p>
                <p className="text-sm font-semibold text-[#0F172A]">{BUDGET_RANGE_LABELS[dancer.budgetRange as keyof typeof BUDGET_RANGE_LABELS]}</p>
              </div>
            )}
            {dancer.heightInches && (
              <div className="p-3 bg-slate-50 rounded-lg text-center">
                <p className="text-xs text-slate-400 mb-1">Height</p>
                <p className="text-sm font-semibold text-[#0F172A]">{Math.floor(dancer.heightInches / 12)}'{dancer.heightInches % 12}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Videos */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-display font-semibold text-xl text-[#0F172A] mb-4">Videos</h2>
          <VideoGallery videos={dancer.videos} />
        </div>

        {/* Competition History */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="font-display font-semibold text-xl text-[#0F172A] mb-4">Competition History</h2>
          <CompetitionTimeline results={dancer.competitionResults} />
        </div>

        {/* Teacher section */}
        {dancer.isTeacher && (
          <>
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TeacherBadge openToProAm={dancer.openToProAm} verified={dancer.teacherVerified} />
                <h2 className="font-display font-semibold text-xl text-[#0F172A]">Teacher Profile</h2>
              </div>

              {dancer.teacherBio && <p className="text-slate-600 mb-4">{dancer.teacherBio}</p>}

              {(dancer.studioAddress || dancer.studioCity) && (
                <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                  <MapPin className="w-4 h-4" />
                  {[dancer.studioAddress, dancer.studioCity, dancer.studioState].filter(Boolean).join(', ')}
                </div>
              )}

              {dancer.travelWillingness && (
                <p className="text-sm text-slate-500 mb-4">
                  Travel: {TRAVEL_WILLINGNESS_LABELS[dancer.travelWillingness as keyof typeof TRAVEL_WILLINGNESS_LABELS]}
                </p>
              )}

              <h3 className="font-semibold text-[#0F172A] mb-3">Lesson Rates</h3>
              <RateCard
                rates={dancer.lessonRates as any}
                teacherName={dancer.displayName || dancer.firstName}
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="font-display font-semibold text-xl text-[#0F172A] mb-4">Reviews</h2>
              <TeacherReviewSection
                reviews={dancer.reviewsReceived as any}
                teacherId={dancer.id}
                canReview={canReview}
                currentUserId={viewerDancerId || undefined}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
