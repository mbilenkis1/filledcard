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

  const request = await prisma.partnerRequest.findUnique({ where: { id: params.id } })
  if (!request || request.toDancerId !== dancer.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { status } = await req.json()
  if (!['ACCEPTED', 'DECLINED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updated = await prisma.partnerRequest.update({
    where: { id: params.id },
    data: { status },
  })

  return NextResponse.json(updated)
}
