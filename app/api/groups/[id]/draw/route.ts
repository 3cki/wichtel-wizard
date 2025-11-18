import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { sendSMS } from '@/lib/twilio'

// Create Secret Santa assignments ensuring:
// 1. No one gets themselves
// 2. Everyone gives to exactly one person
// 3. Everyone receives from exactly one person
// 4. Forms a complete cycle (works with any number of participants)
function createAssignments(participantIds: string[]): { giverId: string; receiverId: string }[] {
  if (participantIds.length < 2) {
    throw new Error('Need at least 2 participants for Secret Santa')
  }

  // Create a derangement (permutation where no element appears in its original position)
  // Using the "early refusal" algorithm for generating random derangements

  const n = participantIds.length
  let receivers: string[] = []
  let attempts = 0
  const maxAttempts = 1000

  while (attempts < maxAttempts) {
    receivers = [...participantIds]

    // Fisher-Yates shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]]
    }

    // Check if this is a valid derangement (no one gets themselves)
    const isValid = participantIds.every((id, index) => id !== receivers[index])

    if (isValid) {
      break
    }

    attempts++
  }

  // If we couldn't find a valid derangement through random shuffling,
  // use a deterministic approach (circular shift)
  if (attempts >= maxAttempts) {
    receivers = [...participantIds.slice(1), participantIds[0]]
  }

  // Verify the assignment is valid
  const receiversSet = new Set(receivers)
  if (receiversSet.size !== participantIds.length) {
    throw new Error('Assignment algorithm failed: duplicate receivers')
  }

  const hasInvalid = participantIds.some((id, index) => id === receivers[index])
  if (hasInvalid) {
    throw new Error('Assignment algorithm failed: someone assigned to themselves')
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
