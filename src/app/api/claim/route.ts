import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { dancerId, ndcaId } = await req.json()
  if (!dancerId) return NextResponse.json({ error: 'Missing dancerId' }, { status: 400 })

  const targetDancer = await prisma.dancer.findUnique({ where: { id: dancerId } })
  if (!targetDancer) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  if (targetDancer.isClaimed) {
    return NextResponse.json({ error: 'This profile has already been claimed' }, { status: 409 })
  }

  // Verify via NDCA ID if one is on the profile
  if (targetDancer.ndcaId) {
    if (!ndcaId || ndcaId.trim() !== targetDancer.ndcaId.trim()) {
      return NextResponse.json({ error: 'NDCA ID does not match our records' }, { status: 400 })
    }
  }

  // Check if this Clerk user already has a dancer profile
  const existingProfile = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (existingProfile) {
    return NextResponse.json({ error: 'You already have a profile. Contact support to merge.' }, { status: 409 })
  }

  const email = user.emailAddresses[0]?.emailAddress || targetDancer.email

  // Claim the profile
  const claimed = await prisma.dancer.update({
    where: { id: dancerId },
    data: {
      clerkUserId: userId,
      email,
      isClaimed: true,
    },
  })

  return NextResponse.json({ success: true, dancer: claimed })
}
