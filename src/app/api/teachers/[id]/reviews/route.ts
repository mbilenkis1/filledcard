import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const reviewer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!reviewer) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // Verify they have an accepted partnership
  const partnership = await prisma.partnerRequest.findFirst({
    where: {
      fromDancerId: reviewer.id,
      toDancerId: params.id,
      status: 'ACCEPTED',
    },
  })

  if (!partnership) {
    return NextResponse.json({ error: 'Only confirmed Pro-Am partners can leave reviews' }, { status: 403 })
  }

  const { rating, body } = await req.json()
  if (!rating || !body?.trim()) {
    return NextResponse.json({ error: 'Rating and review body are required' }, { status: 400 })
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }

  const review = await prisma.teacherReview.upsert({
    where: { teacherId_reviewerId: { teacherId: params.id, reviewerId: reviewer.id } },
    create: {
      teacherId: params.id,
      reviewerId: reviewer.id,
      rating,
      body: body.trim(),
      isVerified: true,
    },
    update: { rating, body: body.trim() },
  })

  return NextResponse.json(review, { status: 201 })
}
