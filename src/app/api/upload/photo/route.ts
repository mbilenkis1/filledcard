import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { cloudinary } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dancer = await prisma.dancer.findUnique({ where: { clerkUserId: userId } })
  if (!dancer) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const url = await new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: `filledcard/profiles/${dancer.id}`,
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
        overwrite: true,
      },
      (err, result) => {
        if (err) reject(err)
        else resolve(result!.secure_url)
      }
    )
    stream.end(buffer)
  })

  await prisma.dancer.update({
    where: { id: dancer.id },
    data: { profilePhoto: url },
  })

  return NextResponse.json({ url })
}
