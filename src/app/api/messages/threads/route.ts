import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json([])

  // Get all people this dancer has exchanged messages with
  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: dancer.id }, { receiverId: dancer.id }],
    },
    include: {
      sender: true,
      receiver: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Build thread map
  const threadMap = new Map<string, any>()
  for (const msg of messages) {
    const otherId = msg.senderId === dancer.id ? msg.receiverId : msg.senderId
    const other = msg.senderId === dancer.id ? msg.receiver : msg.sender

    if (!threadMap.has(otherId)) {
      const unreadCount = await prisma.message.count({
        where: { senderId: otherId, receiverId: dancer.id, isRead: false },
      })
      threadMap.set(otherId, {
        dancer: {
          id: other.id,
          firstName: other.firstName,
          lastName: other.lastName,
          displayName: other.displayName,
          profilePhoto: other.profilePhoto,
        },
        lastMessage: msg.content,
        lastMessageAt: msg.createdAt,
        unreadCount,
      })
    }
  }

  return NextResponse.json(Array.from(threadMap.values()))
}
