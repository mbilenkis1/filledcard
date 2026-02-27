export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [
    totalDancers,
    claimedProfiles,
    unclaimedProfiles,
    totalTeachers,
    verifiedTeachers,
    totalCompetitions,
    pendingTeacherVerifications,
  ] = await Promise.all([
    prisma.dancer.count(),
    prisma.dancer.count({ where: { isClaimed: true } }),
    prisma.dancer.count({ where: { isClaimed: false } }),
    prisma.dancer.count({ where: { isTeacher: true } }),
    prisma.dancer.count({ where: { isTeacher: true, teacherVerified: true } }),
    prisma.competitionResult.count(),
    prisma.dancer.findMany({
      where: { isTeacher: true, teacherVerified: false },
      select: { id: true, firstName: true, lastName: true, email: true, isTeacher: true, teacherVerified: true, isClaimed: true },
    }),
  ])

  return NextResponse.json({
    totalDancers,
    claimedProfiles,
    unclaimedProfiles,
    totalTeachers,
    verifiedTeachers,
    totalCompetitions,
    pendingTeacherVerifications,
  })
}
