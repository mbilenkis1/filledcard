import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const dancer = await prisma.dancer.update({
    where: { id: params.id },
    data: { teacherVerified: true },
  })
  return NextResponse.json({ success: true, dancer })
}
