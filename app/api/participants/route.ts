import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAnonymousName } from '@/lib/name-generator'
import { auth } from '@/auth'
import { sendSMS } from '@/lib/twilio'

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
    const { groupCode } = body

    if (!groupCode) {
      return NextResponse.json(
        { error: 'Gruppen-Code ist erforderlich' },
        { status: 400 }
      )
    }

    const group = await prisma.group.findUnique({
      where: { code: groupCode },
      include: {
        participants: true,
        creator: true,
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Gruppe nicht gefunden' },
        { status: 404 }
      )
    }

    // Check if user already joined this group
    const existingParticipant = await prisma.participant.findFirst({
      where: {
        groupId: group.id,
        userId: session.user.id,
      },
    })

    if (existingParticipant) {
      return NextResponse.json(existingParticipant, { status: 200 })
    }

    // Generate unique anonymous name within the group
    let anonymousName = generateAnonymousName()
    let nameExists = group.participants.some(p => p.anonymousName === anonymousName)

    while (nameExists) {
      anonymousName = generateAnonymousName()
      nameExists = group.participants.some(p => p.anonymousName === anonymousName)
    }

    const participant = await prisma.participant.create({
      data: {
        anonymousName,
        userId: session.user.id,
        groupId: group.id,
      },
    })

    // Send SMS notification to group creator (if not the creator joining)
    if (group.creator.phoneNumber && group.creatorId !== session.user.id) {
      const message = `Wichtel Wizard: ${anonymousName} ist deiner Gruppe "${group.name}" beigetreten! 🎁`
      await sendSMS(group.creator.phoneNumber, message)
    }

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    console.error('Error creating participant:', error)
    return NextResponse.json(
      { error: 'Fehler beim Beitreten zur Gruppe' },
      { status: 500 }
    )
  }
}
