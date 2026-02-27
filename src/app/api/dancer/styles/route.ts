import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { DANCE_STYLES } from '@/lib/constants'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { style, level, isCompeting, wantsToCompete } = await req.json()

  if (!style || !level) {
    return NextResponse.json({ error: 'style and level are required' }, { status: 400 })
  }

  const styleInfo = DANCE_STYLES[style as keyof typeof DANCE_STYLES]
  if (!styleInfo) return NextResponse.json({ error: 'Invalid style' }, { status: 400 })

  const danceStyle = await prisma.danceStyle.upsert({
    where: { dancerId_style: { dancerId: dancer.id, style } },
    create: {
      dancerId: dancer.id,
      style,
      category: styleInfo.category as any,
      level,
      isCompeting: !!isCompeting,
      wantsToCompete: !!wantsToCompete,
    },
    update: {
      level,
      isCompeting: !!isCompeting,
      wantsToCompete: !!wantsToCompete,
    },
  })

  return NextResponse.json(danceStyle)
}
