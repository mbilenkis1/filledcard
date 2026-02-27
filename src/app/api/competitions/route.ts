import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json([])

  const results = await prisma.competitionResult.findMany({
    where: { dancerId: dancer.id },
    orderBy: { competitionDate: 'desc' },
  })

  return NextResponse.json(results)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const {
    competitionName, competitionDate, location,
    partnerName, style, level, placement, totalCompetitors, source
  } = await req.json()

  if (!competitionName || !competitionDate || !style || !level) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const result = await prisma.competitionResult.create({
    data: {
      dancerId: dancer.id,
      competitionName,
      competitionDate: new Date(competitionDate),
      location: location || null,
      partnerName: partnerName || null,
      style,
      level,
      placement: placement || null,
      totalCompetitors: totalCompetitors || null,
      source: source || 'MANUAL',
    },
  })

  return NextResponse.json(result, { status: 201 })
}
