import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { sendSMS } from '@/lib/twilio'

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Create Secret Santa assignments ensuring no one gets themselves
function createAssignments(participantIds: string[]): { giverId: string; receiverId: string }[] {
  if (participantIds.length < 2) {
    throw new Error('Need at least 2 participants for Secret Santa')
  }

  let receivers = shuffleArray(participantIds)

  // Check if anyone got themselves
  let hasInvalidAssignment = participantIds.some((giverId, index) => giverId === receivers[index])

  // Keep shuffling until we have a valid assignment
  let attempts = 0
  const maxAttempts = 100

  while (hasInvalidAssignment && attempts < maxAttempts) {
    receivers = shuffleArray(participantIds)
    hasInvalidAssignment = participantIds.some((giverId, index) => giverId === receivers[index])
    attempts++
  }

  if (hasInvalidAssignment) {
    // Fix the invalid assignments by swapping
    for (let i = 0; i < participantIds.length; i++) {
      if (participantIds[i] === receivers[i]) {
        // Find someone to swap with
        const swapIndex = (i + 1) % participantIds.length
        ;[receivers[i], receivers[swapIndex]] = [receivers[swapIndex], receivers[i]]
      }
    }
  }

  return participantIds.map((giverId, index) => ({
    giverId,
    receiverId: receivers[index],
  }))
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: true,
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

    // Check if user is the group creator
    if (group.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Nur der Gruppen-Ersteller kann die Auslosung durchführen' },
        { status: 403 }
      )
    }

    if (group.drawn) {
      return NextResponse.json(
        { error: 'Secret Santa has already been drawn for this group' },
        { status: 400 }
      )
    }

    if (group.participants.length < 2) {
      return NextResponse.json(
        { error: 'Mindestens 2 Teilnehmer sind erforderlich' },
        { status: 400 }
      )
    }

    // Check if all participants have at least one wish
    const participantsWithoutWishes = group.participants.filter(p => p.wishes.length === 0)
    if (participantsWithoutWishes.length > 0) {
      const names = participantsWithoutWishes.map(p => p.anonymousName).join(', ')
      return NextResponse.json(
        { error: `Folgende Teilnehmer haben noch keine Wünsche hinzugefügt: ${names}` },
        { status: 400 }
      )
    }

    const participantIds = group.participants.map(p => p.id)
    const assignments = createAssignments(participantIds)

    // Create all assignments in a transaction
    await prisma.$transaction([
      ...assignments.map(({ giverId, receiverId }) =>
        prisma.assignment.create({
          data: {
            groupId: id,
            giverId,
            receiverId,
          },
        })
      ),
      prisma.group.update({
        where: { id },
        data: { drawn: true },
      }),
    ])

    // Send SMS notifications to all participants
    const smsPromises = group.participants.map(async (participant) => {
      if (participant.user.phoneNumber) {
        const message = `Wichtel Wizard: Die Auslosung für "${group.name}" wurde durchgeführt! Schau nach, wen du beschenken darfst 🎁`
        await sendSMS(participant.user.phoneNumber, message)
      }
    })

    // Send all SMS in parallel (don't wait for them to avoid slowing down the response)
    Promise.all(smsPromises).catch(error => {
      console.error('Error sending SMS notifications:', error)
    })

    return NextResponse.json({ success: true, message: 'Secret Santa drawn successfully!' })
  } catch (error) {
    console.error('Error drawing Secret Santa:', error)
    return NextResponse.json(
      { error: 'Failed to draw Secret Santa' },
      { status: 500 }
    )
  }
}
