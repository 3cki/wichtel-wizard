import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUniqueGroupCode, generateAnonymousName } from '@/lib/name-generator'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, drawDate } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      )
    }

    // Generate unique group code
    let code = generateUniqueGroupCode()
    let codeExists = await prisma.group.findUnique({ where: { code } })

    while (codeExists) {
      code = generateUniqueGroupCode()
      codeExists = await prisma.group.findUnique({ where: { code } })
    }

    // Create group and automatically add creator as participant
    const group = await prisma.group.create({
      data: {
        name,
        description,
        code,
        drawDate: drawDate ? new Date(drawDate) : null,
        creatorId: session.user.id,
        participants: {
          create: {
            anonymousName: generateAnonymousName(),
            userId: session.user.id,
          },
        },
      },
    })

    return NextResponse.json(group, { status: 201 })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
      const group = await prisma.group.findUnique({
        where: { code },
        include: {
          participants: {
            include: {
              wishes: true,
            },
          },
        },
      })

      if (!group) {
        return NextResponse.json(
          { error: 'Group not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(group)
    }

    return NextResponse.json(
      { error: 'Group code is required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error fetching group:', error)
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    )
  }
}
