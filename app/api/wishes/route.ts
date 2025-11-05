import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { participantId, title, description, url, priority } = body

    if (!participantId || !title) {
      return NextResponse.json(
        { error: 'Participant ID and wish title are required' },
        { status: 400 }
      )
    }

    const wish = await prisma.wish.create({
      data: {
        title,
        description,
        url,
        priority: priority || 0,
        participantId,
      },
    })

    return NextResponse.json(wish, { status: 201 })
  } catch (error) {
    console.error('Error creating wish:', error)
    return NextResponse.json(
      { error: 'Failed to create wish' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wishId = searchParams.get('id')

    if (!wishId) {
      return NextResponse.json(
        { error: 'Wish ID is required' },
        { status: 400 }
      )
    }

    await prisma.wish.delete({
      where: { id: wishId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting wish:', error)
    return NextResponse.json(
      { error: 'Failed to delete wish' },
      { status: 500 }
    )
  }
}
