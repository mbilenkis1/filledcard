import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const style = await prisma.danceStyle.findUnique({ where: { id: params.id } })
  if (!style || style.dancerId !== dancer.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await prisma.danceStyle.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
