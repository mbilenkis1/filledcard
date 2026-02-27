export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/Button'
import { prisma } from '@/lib/prisma'
import { DancerCard } from '@/components/dancers/DancerCard'
import { Users, Trophy, Heart, Star, ChevronRight } from 'lucide-react'

async function getStats() {
  try {
    const [totalDancers, totalResults, totalTeachers] = await Promise.all([
      prisma.dancer.count(),
      prisma.competitionResult.count(),
      prisma.dancer.count({ where: { isTeacher: true, teacherVerified: true } }),
    ])
    return { totalDancers, totalResults, totalTeachers }
  } catch {
    return { totalDancers: 0, totalResults: 0, totalTeachers: 0 }
  }
}

async function getFeaturedDancers() {
  try {
    return await prisma.dancer.findMany({
      where: { isClaimed: true },
      include: { danceStyles: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })
  } catch {
    return []
  }
}

async function getFeaturedTeachers() {
  try {
    return await prisma.dancer.findMany({
      where: { isTeacher: true, teacherVerified: true },
      include: { danceStyles: true },
      take: 4,
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [stats, featuredDancers, featuredTeachers] = await Promise.all([
    getStats(),
    getFeaturedDancers(),
    getFeaturedTeachers(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="gradient-navy-gold text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
            <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse" />
            <span className="text-white/80">The ballroom dance community</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 leading-tight">
            Fill Your<br />
            <span className="text-[#D4AF37]">Dance Card</span>
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Build your dancer profile, showcase your competition history, find the perfect partner, and connect with professional teachers for Pro-Am partnerships.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <SignUpButton mode="modal">
              <Button variant="primary" size="lg">Get Started Free</Button>
            </SignUpButton>
            <Link href="/search">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 hover:border-white/50"
              >
                Browse Dancers
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-display font-bold text-3xl text-[#0F172A]">
              {stats.totalDancers.toLocaleString()}
            </p>
            <p className="text-slate-500 text-sm mt-1 flex items-center justify-center gap-1">
              <Users className="w-4 h-4" /> Dancers
            </p>
          </div>
          <div>
            <p className="font-display font-bold text-3xl text-[#0F172A]">
              {stats.totalResults.toLocaleString()}
            </p>
            <p className="text-slate-500 text-sm mt-1 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" /> Competition Results
            </p>
          </div>
          <div>
            <p className="font-display font-bold text-3xl text-[#0F172A]">
              {stats.totalTeachers.toLocaleString()}
            </p>
            <p className="text-slate-500 text-sm mt-1 flex items-center justify-center gap-1">
              <Star className="w-4 h-4" /> Verified Teachers
            </p>
          </div>
        </div>
      </section>

      {/* Featured Dancers */}
      {featuredDancers.length > 0 && (
        <section className="py-16 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl font-bold text-[#0F172A]">Featured Dancers</h2>
              <Link href="/search" className="text-sm text-[#D4AF37] hover:text-[#A68B2A] font-medium flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredDancers.map(dancer => (
                <DancerCard key={dancer.id} dancer={dancer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Teachers */}
      {featuredTeachers.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-[#0F172A]">Pro Teachers</h2>
                <p className="text-slate-500 mt-1">Connect with verified professionals for Pro-Am partnerships</p>
              </div>
              <Link href="/teachers" className="text-sm text-[#D4AF37] hover:text-[#A68B2A] font-medium flex items-center gap-1">
                Browse all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredTeachers.map(dancer => (
                <DancerCard key={dancer.id} dancer={dancer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Value Props */}
      <section className="py-20 px-4 bg-[#0F172A] text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center mb-12">
            Everything you need to <span className="text-[#D4AF37]">dance further</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-6 h-6 text-[#D4AF37]" />,
                title: 'Find Your Partner',
                desc: 'Our compatibility algorithm matches you with dancers who share your styles, level, and goals.'
              },
              {
                icon: <Trophy className="w-6 h-6 text-[#D4AF37]" />,
                title: 'Showcase Results',
                desc: 'Import competition history from NDCA and O2CM, or add results manually. Build your dance résumé.'
              },
              {
                icon: <Heart className="w-6 h-6 text-[#D4AF37]" />,
                title: 'Pro-Am Connections',
                desc: 'Amateur dancers and professional teachers find each other for Pro-Am partnerships and lessons.'
              },
            ].map(item => (
              <div key={item.title} className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-[#0F172A] mb-4">Ready to fill your dance card?</h2>
          <p className="text-slate-500 mb-8">Join the ballroom dance community. It's free to sign up and build your profile.</p>
          <SignUpButton mode="modal">
            <Button variant="primary" size="lg">Join FilledCard Free</Button>
          </SignUpButton>
        </div>
      </section>
    </div>
  )
}
