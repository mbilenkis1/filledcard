export const dynamic = 'force-dynamic'

import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DancerCard } from '@/components/dancers/DancerCard'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { calculateMatchScore } from '@/lib/matching'
import { formatLocation } from '@/lib/utils'
import { PartnerRequestCard } from '@/components/dashboard/PartnerRequestCard'
import { MessageCircle, Heart, Trophy, Bell, ChevronRight, Users } from 'lucide-react'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const user = await currentUser()
  if (!user) redirect('/sign-in')

  let dancer = await prisma.dancer.findUnique({
    where: { clerkUserId: user.id },
    include: { danceStyles: true },
  })

  // If no profile yet, create one from Clerk data
  if (!dancer) {
    const email = user.emailAddresses[0]?.emailAddress || ''
    dancer = await prisma.dancer.create({
      data: {
        clerkUserId: user.id,
        email,
        firstName: user.firstName || 'Dancer',
        lastName: user.lastName || '',
        isClaimed: true,
        partnerStatus: 'OPEN_TO_INQUIRIES',
      },
      include: { danceStyles: true },
    })
  }

  // Get recent messages
  const recentMessages = await prisma.message.findMany({
    where: { receiverId: dancer.id, isRead: false },
    include: { sender: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // Get incoming partner requests
  const partnerRequests = await prisma.partnerRequest.findMany({
    where: { toDancerId: dancer.id, status: 'PENDING' },
    include: { fromDancer: { include: { danceStyles: true } } },
    orderBy: { createdAt: 'desc' },
    take: 5,
  })

  // Get potential matches
  const allDancers = await prisma.dancer.findMany({
    where: {
      id: { not: dancer.id },
      isClaimed: true,
    },
    include: { danceStyles: true },
    take: 50,
  })

  const matches = allDancers
    .map(d => ({ dancer: d, ...calculateMatchScore(dancer!, d) }))
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  const profileComplete = !!(dancer.bio && dancer.danceStyles.length > 0 && dancer.city)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#0F172A] text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              src={dancer.profilePhoto}
              firstName={dancer.firstName}
              lastName={dancer.lastName}
              size="lg"
            />
            <div>
              <p className="text-white/60 text-sm">Welcome back</p>
              <h1 className="font-display text-2xl font-bold">
                {dancer.displayName || dancer.firstName}
              </h1>
              {formatLocation(dancer.city, dancer.state) && (
                <p className="text-white/50 text-sm">{formatLocation(dancer.city, dancer.state)}</p>
              )}
            </div>
          </div>
          <Link href="/profile/edit">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile incomplete banner */}
        {!profileComplete && (
          <div className="mb-6 p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-xl flex items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-[#0F172A] text-sm">Complete your profile</p>
              <p className="text-xs text-slate-600 mt-0.5">Add your bio, dance styles, and location to unlock better matches.</p>
            </div>
            <Link href="/profile/edit">
              <Button size="sm">Complete Profile</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top matches */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-[#0F172A] flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#D4AF37]" /> Your Matches
                </h2>
                <Link href="/matches" className="text-sm text-[#D4AF37] hover:text-[#A68B2A] flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {matches.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
                  <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="text-slate-500 text-sm">No matches yet. Complete your profile and add dance styles to find matches.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {matches.slice(0, 4).map(m => (
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

            {/* Competition history preview */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-[#0F172A] flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#D4AF37]" /> Competition History
                </h2>
                <Link href="/competitions" className="text-sm text-[#D4AF37] hover:text-[#A68B2A] flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center">
                <Trophy className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                <p className="text-slate-400 text-sm">Track your competition journey</p>
                <Link href="/competitions">
                  <Button variant="outline" size="sm" className="mt-3">Add Results</Button>
                </Link>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <section className="bg-white rounded-2xl border border-slate-100 p-5">
              <h3 className="font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#D4AF37]" /> Activity
              </h3>

              {recentMessages.length === 0 && partnerRequests.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {partnerRequests.map(req => (
                    <PartnerRequestCard
                      key={req.id}
                      request={{
                        id: req.id,
                        message: req.message,
                        createdAt: req.createdAt.toISOString(),
                        fromDancer: {
                          id: req.fromDancer.id,
                          firstName: req.fromDancer.firstName,
                          lastName: req.fromDancer.lastName,
                          displayName: req.fromDancer.displayName,
                          profilePhoto: req.fromDancer.profilePhoto,
                        },
                      }}
                    />
                  ))}
                  {recentMessages.map(msg => (
                    <div key={msg.id} className="flex items-start gap-3">
                      <Avatar
                        src={msg.sender.profilePhoto}
                        firstName={msg.sender.firstName}
                        lastName={msg.sender.lastName}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0F172A] font-medium truncate">
                          {msg.sender.firstName} {msg.sender.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link href="/messages">
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <MessageCircle className="w-4 h-4" /> Messages
                </Button>
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
