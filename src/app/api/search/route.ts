import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const style = searchParams.get('style') || ''
  const level = searchParams.get('level') || ''
  const state = searchParams.get('state') || ''
  const status = searchParams.get('status') || ''
  const teachersOnly = searchParams.get('teachers') === 'true'
  const unclaimedOnly = searchParams.get('unclaimed') === 'true'
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = 20

  const where: any = {}

  if (unclaimedOnly) {
    where.isClaimed = false
  }

  if (teachersOnly) {
    where.isTeacher = true
    where.openToProAm = true
  }

  if (status) {
    where.partnerStatus = status
  }

  if (state) {
    where.state = state
  }

  if (style || level) {
    where.danceStyles = {
      some: {
        ...(style && { style }),
        ...(level && { level }),
      },
    }
  }

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: 'insensitive' } },
      { lastName: { contains: q, mode: 'insensitive' } },
      { displayName: { contains: q, mode: 'insensitive' } },
      { city: { contains: q, mode: 'insensitive' } },
      { studioName: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [total, dancers] = await Promise.all([
    prisma.dancer.count({ where }),
    prisma.dancer.findMany({
      where,
      include: { danceStyles: true },
      orderBy: [
        { isClaimed: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return NextResponse.json({
    dancers,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  })
}
