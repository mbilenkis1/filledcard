import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await currentUser()
  let dancer = await prisma.dancer.findUnique({
    where: { clerkUserId: userId },
    include: { danceStyles: true },
  })

  if (!dancer && user) {
    const email = user.emailAddresses[0]?.emailAddress || ''
    dancer = await prisma.dancer.create({
      data: {
        clerkUserId: userId,
        email,
        firstName: user.firstName || 'Dancer',
        lastName: user.lastName || '',
        isClaimed: true,
        partnerStatus: 'OPEN_TO_INQUIRIES',
      },
      include: { danceStyles: true },
    })
  }

  return NextResponse.json(dancer)
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()

  // Whitelist of updatable fields
  const {
    firstName, lastName, displayName, bio,
    city, state, country,
    heightInches, birthYear,
    studioName, coachName,
    instagramHandle, youtubeHandle,
    partnerStatus, partnerStatusVisibility, partnershipType,
    competitionFrequency, budgetRange,
    ndcaId,
    isTeacher, openToProAm,
    teacherBio, studioAddress, studioCity, studioState,
    travelWillingness, lessonRates,
  } = body

  const updated = await prisma.dancer.update({
    where: { id: dancer.id },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(country !== undefined && { country }),
      ...(heightInches !== undefined && { heightInches }),
      ...(birthYear !== undefined && { birthYear }),
      ...(studioName !== undefined && { studioName }),
      ...(coachName !== undefined && { coachName }),
      ...(instagramHandle !== undefined && { instagramHandle }),
      ...(youtubeHandle !== undefined && { youtubeHandle }),
      ...(partnerStatus !== undefined && { partnerStatus }),
      ...(partnerStatusVisibility !== undefined && { partnerStatusVisibility }),
      ...(partnershipType !== undefined && { partnershipType }),
      ...(competitionFrequency !== undefined && { competitionFrequency: competitionFrequency || null }),
      ...(budgetRange !== undefined && { budgetRange: budgetRange || null }),
      ...(ndcaId !== undefined && { ndcaId }),
      ...(isTeacher !== undefined && { isTeacher }),
      ...(openToProAm !== undefined && { openToProAm }),
      ...(teacherBio !== undefined && { teacherBio }),
      ...(studioAddress !== undefined && { studioAddress }),
      ...(studioCity !== undefined && { studioCity }),
      ...(studioState !== undefined && { studioState }),
      ...(travelWillingness !== undefined && { travelWillingness: travelWillingness || null }),
      ...(lessonRates !== undefined && { lessonRates }),
    },
    include: { danceStyles: true },
  })

  return NextResponse.json(updated)
}
