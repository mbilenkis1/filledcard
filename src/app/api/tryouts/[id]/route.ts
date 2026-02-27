import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const tryout = await prisma.tryout.findUnique({ where: { id: params.id } })
  if (!tryout) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isParticipant = tryout.requesterId === dancer.id || tryout.recipientId === dancer.id
  if (!isParticipant) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { status, datetime, locationText, notes } = await req.json()

  const validTransitions: Record<string, string[]> = {
    PROPOSED: ['CONFIRMED', 'RESCHEDULE_REQUESTED', 'CANCELED'],
    CONFIRMED: ['RESCHEDULE_REQUESTED', 'CANCELED'],
    RESCHEDULE_REQUESTED: ['PROPOSED', 'CONFIRMED', 'CANCELED'],
  }

  if (status && !validTransitions[tryout.status]?.includes(status)) {
    return NextResponse.json({ error: `Cannot transition from ${tryout.status} to ${status}` }, { status: 400 })
  }

  const updated = await prisma.tryout.update({
    where: { id: params.id },
    data: {
      ...(status && { status }),
      ...(datetime && { datetime: new Date(datetime) }),
      ...(locationText && { locationText }),
      ...(notes !== undefined && { notes }),
      proposedById: dancer.id,
    },
    include: {
      requester: { select: { id: true, firstName: true, lastName: true, displayName: true, profilePhoto: true } },
      recipient: { select: { id: true, firstName: true, lastName: true, displayName: true, profilePhoto: true } },
    },
  })

  return NextResponse.json(updated)
}
