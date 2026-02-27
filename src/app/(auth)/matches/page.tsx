export const dynamic = 'force-dynamic'

import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { DancerCard } from '@/components/dancers/DancerCard'
import { calculateMatchScore } from '@/lib/matching'
import { Heart, Star } from 'lucide-react'

export default async function MatchesPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  const dancer = await prisma.dancer.findUnique({
    where: { clerkUserId: user.id },
    include: { danceStyles: true },
  })

  if (!dancer) redirect('/dashboard')

  const allDancers = await prisma.dancer.findMany({
    where: { id: { not: dancer.id }, isClaimed: true },
    include: { danceStyles: true },
    take: 100,
  })

  const amateurMatches = allDancers
    .filter(d => !d.isTeacher)
    .map(d => ({ dancer: d, ...calculateMatchScore(dancer, d) }))
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)

  const proAmMatches = allDancers
    .filter(d => d.isTeacher && d.openToProAm)
    .map(d => ({ dancer: d, ...calculateMatchScore(dancer, d) }))
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-[#0F172A] mb-8">Your Matches</h1>

        {/* Partner Matches */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-[#0F172A] mb-2 flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D4AF37]" /> Partner Matches
          </h2>
          <p className="text-slate-500 text-sm mb-6">Amateur-amateur partnerships based on compatibility</p>

          {amateurMatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
              <p>Add dance styles to your profile to see partner matches.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {amateurMatches.map(m => (
                <DancerCard
                  key={m.dancer.id}
                  dancer={m.dancer}
                  matchScore={m.score}
                  matchReasons={m.reasons}
                  showMatchScore
                />
              ))}
            </div>
          )}
        </section>

        {/* Pro-Am Matches */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-[#0F172A] mb-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#D4AF37]" /> Pro-Am Teachers
          </h2>
          <p className="text-slate-500 text-sm mb-6">Verified teachers open to Pro-Am partnerships</p>

          {proAmMatches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
              <p>No Pro-Am matches found. Add PRO_AM to your partnership preferences.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {proAmMatches.map(m => (
                <DancerCard
                  key={m.dancer.id}
                  dancer={m.dancer}
                  matchScore={m.score}
                  matchReasons={m.reasons}
                  showMatchScore
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
