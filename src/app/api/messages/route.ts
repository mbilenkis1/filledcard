import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json([])

  const { searchParams } = new URL(req.url)
  const withId = searchParams.get('with')

  if (!withId) return NextResponse.json({ error: 'Missing with param' }, { status: 400 })

  // Mark as read
  await prisma.message.updateMany({
    where: { senderId: withId, receiverId: dancer.id, isRead: false },
    data: { isRead: true },
  })

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: dancer.id, receiverId: withId },
        { senderId: withId, receiverId: dancer.id },
      ],
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(messages)
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sender = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!sender) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const { receiverId, content } = await req.json()
  if (!receiverId || !content?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const receiver = await prisma.dancer.findUnique({ where: { id: receiverId } })
  if (!receiver) return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })

  const message = await prisma.message.create({
    data: {
      senderId: sender.id,
      receiverId,
      content: content.trim(),
    },
  })

  return NextResponse.json(message, { status: 201 })
}
