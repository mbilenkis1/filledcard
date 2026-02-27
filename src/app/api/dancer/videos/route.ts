import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getVideoThumbnail } from '@/lib/cloudinary'

function detectPlatform(url: string): 'YOUTUBE' | 'INSTAGRAM' | 'OTHER' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YOUTUBE'
  if (url.includes('instagram.com')) return 'INSTAGRAM'
  return 'OTHER'
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { url, title } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

  const platform = detectPlatform(url)
  const thumbnailUrl = getVideoThumbnail(platform, url)

  const video = await prisma.video.create({
    data: {
      dancerId: dancer.id,
      url,
      title: title || null,
      platform,
      thumbnailUrl: thumbnailUrl || null,
    },
  })

  return NextResponse.json(video, { status: 201 })
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json([])

  const videos = await prisma.video.findMany({
    where: { dancerId: dancer.id },
    orderBy: { addedAt: 'desc' },
  })

  return NextResponse.json(videos)
}
