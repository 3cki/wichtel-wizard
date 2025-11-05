import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    // Get all groups where the user is a participant
    const participants = await prisma.participant.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        group: {
          include: {
            _count: {
              select: { participants: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const groups = participants.map(p => ({
      ...p.group,
      participantCount: p.group._count.participants,
      myAnonymousName: p.anonymousName,
    }))

    return NextResponse.json(groups)
  } catch (error) {
    console.error('Error fetching user groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}
