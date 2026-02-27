import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sender = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!sender) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { toDancerId, message } = await req.json()
  if (!toDancerId) return NextResponse.json({ error: 'Missing toDancerId' }, { status: 400 })

  const existing = await prisma.partnerRequest.findFirst({
    where: { fromDancerId: sender.id, toDancerId, status: 'PENDING' },
  })

  if (existing) {
    return NextResponse.json({ error: 'Request already sent' }, { status: 409 })
  }

  const request = await prisma.partnerRequest.create({
    data: { fromDancerId: sender.id, toDancerId, message: message || null },
  })

  return NextResponse.json(request, { status: 201 })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json([])

  const requests = await prisma.partnerRequest.findMany({
    where: { toDancerId: dancer.id, status: 'PENDING' },
    include: { fromDancer: { include: { danceStyles: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(requests)
}
