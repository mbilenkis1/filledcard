import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const tryouts = await prisma.tryout.findMany({
    where: {
      OR: [{ requesterId: dancer.id }, { recipientId: dancer.id }],
      status: { in: ['PROPOSED', 'CONFIRMED'] },
    },
    include: {
      requester: { select: { id: true, firstName: true, lastName: true, displayName: true, profilePhoto: true } },
      recipient: { select: { id: true, firstName: true, lastName: true, displayName: true, profilePhoto: true } },
    },
    orderBy: { datetime: 'asc' },
  })

  return NextResponse.json(tryouts)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { recipientId, datetime, locationText, notes } = await req.json()

  if (!recipientId || !datetime || !locationText) {
    return NextResponse.json({ error: 'recipientId, datetime, and locationText are required' }, { status: 400 })
  }

  const recipient = await prisma.dancer.findUnique({ where: { id: recipientId } })
  if (!recipient) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })

  const tryout = await prisma.tryout.create({
    data: {
      requesterId: dancer.id,
      recipientId,
      proposedById: dancer.id,
      datetime: new Date(datetime),
      locationText,
      notes: notes || null,
      status: 'PROPOSED',
    },
    include: {
      requester: { select: { id: true, firstName: true, lastName: true, displayName: true, profilePhoto: true } },
      recipient: { select: { id: true, firstName: true, lastName: true, displayName: true, profilePhoto: true } },
    },
  })

  return NextResponse.json(tryout, { status: 201 })
}
