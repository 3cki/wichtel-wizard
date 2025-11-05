import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const assignment = await prisma.assignment.findUnique({
      where: { giverId: id },
      include: {
        receiver: {
          include: {
            wishes: true,
          },
        },
        group: true,
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: 'No assignment found. Secret Santa may not have been drawn yet.' },
        { status: 404 }
      )
    }

    if (!assignment.group.drawn) {
      return NextResponse.json(
        { error: 'Secret Santa has not been drawn yet' },
        { status: 400 }
      )
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error('Error fetching assignment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignment' },
      { status: 500 }
    )
  }
}
