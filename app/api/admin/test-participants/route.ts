import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Anonymous name pool for test participants
const ANONYMOUS_NAMES = [
  'Festlicher Schneemann',
  'Fröhliches Rentier',
  'Munterer Wichtel',
  'Freudiger Pinguin',
  'Glücklicher Lebkuchen',
  'Funkelnder Stern',
  'Gemütlicher Fäustling',
  'Helle Kerze',
  'Süßes Plätzchen',
  'Warmer Kakao',
  'Frostige Glocke',
  'Glitzerndes Licht',
  'Verschneite Eule',
  'Zuckerstange',
  'Stechpalmenbeere',
]

// Random wishes for test participants
const SAMPLE_WISHES = [
  { title: 'Brettspiel', description: 'Ein lustiges Gesellschaftsspiel für Spieleabende', url: null },
  { title: 'Buch', description: 'Ein spannender Roman oder Sachbuch', url: null },
  { title: 'Tasse', description: 'Eine coole oder lustige Tasse für Kaffee/Tee', url: null },
  { title: 'Pflanzen', description: 'Eine kleine Zimmerpflanze', url: null },
  { title: 'Süßigkeiten Box', description: 'Eine Sammlung leckerer Süßigkeiten', url: null },
  { title: 'Kerzen Set', description: 'Duftkerzen für gemütliche Abende', url: null },
  { title: 'Puzzle', description: 'Ein schönes 1000-Teile Puzzle', url: null },
  { title: 'Notizbuch', description: 'Ein hochwertiges Notizbuch oder Journal', url: null },
  { title: 'USB-Gadget', description: 'Ein praktisches oder lustiges USB-Gerät', url: null },
  { title: 'Thermoskanne', description: 'Für warme Getränke unterwegs', url: null },
  { title: 'Bluetooth Lautsprecher', description: 'Kleiner tragbarer Lautsprecher', url: null },
  { title: 'Tee-Set', description: 'Verschiedene exotische Teesorten', url: null },
  { title: 'Kochbuch', description: 'Mit leckeren Rezepten', url: null },
  { title: 'Handschuhe', description: 'Warme Handschuhe für den Winter', url: null },
  { title: 'Schal', description: 'Ein gemütlicher Schal', url: null },
  { title: 'Socken', description: 'Lustige oder warme Socken', url: null },
  { title: 'Powerbank', description: 'Zum Laden von Smartphones unterwegs', url: null },
  { title: 'Schlüsselanhänger', description: 'Ein cooler oder personalisierter Schlüsselanhänger', url: null },
  { title: 'Fotoalbum', description: 'Zum Sammeln von Erinnerungen', url: null },
  { title: 'Yoga-Matte', description: 'Für Yoga oder Fitness zu Hause', url: null },
]

export async function POST(request: NextRequest) {
  // Only allow in development (never in production)
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Admin endpoints are disabled in production' },
      { status: 403 }
    )
  }

  try {
    const { groupCode, count = 1 } = await request.json()

    if (!groupCode) {
      return NextResponse.json(
        { error: 'Group code is required' },
        { status: 400 }
      )
    }

    if (count < 1 || count > 10) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 10' },
        { status: 400 }
      )
    }

    // Find the group
    const group = await prisma.group.findUnique({
      where: { code: groupCode },
      include: {
        participants: true,
      },
    })

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    if (group.drawn) {
      return NextResponse.json(
        { error: 'Cannot add participants after drawing has been performed' },
        { status: 400 }
      )
    }

    // Get used anonymous names in this group
    const usedNames = group.participants.map(p => p.anonymousName)
    const availableNames = ANONYMOUS_NAMES.filter(name => !usedNames.includes(name))

    if (availableNames.length < count) {
      return NextResponse.json(
        { error: `Not enough unique anonymous names available. Maximum ${availableNames.length} more participants can be added.` },
        { status: 400 }
      )
    }

    // Create test users and participants
    const createdParticipants = []

    for (let i = 0; i < count; i++) {
      // Generate unique test phone number
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 10000)
      const testPhoneNumber = `+49test${timestamp}${random}`

      // Create test user
      const user = await prisma.user.create({
        data: {
          name: `Test User ${timestamp}${random}`,
          phoneNumber: testPhoneNumber,
        },
      })

      // Pick a random available anonymous name
      const nameIndex = Math.floor(Math.random() * availableNames.length)
      const anonymousName = availableNames.splice(nameIndex, 1)[0]

      // Create participant
      const participant = await prisma.participant.create({
        data: {
          userId: user.id,
          groupId: group.id,
          anonymousName,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
            },
          },
        },
      })

      // Add 2-4 random wishes for this participant
      const numWishes = Math.floor(Math.random() * 3) + 2 // Random number between 2 and 4
      const shuffledWishes = [...SAMPLE_WISHES].sort(() => Math.random() - 0.5)
      const selectedWishes = shuffledWishes.slice(0, numWishes)

      await Promise.all(
        selectedWishes.map((wish, index) =>
          prisma.wish.create({
            data: {
              participantId: participant.id,
              title: wish.title,
              description: wish.description,
              url: wish.url,
              priority: index,
            },
          })
        )
      )

      createdParticipants.push(participant)
    }

    return NextResponse.json({
      success: true,
      message: `Added ${count} test participant(s) to group "${group.name}"`,
      participants: createdParticipants,
    })
  } catch (error) {
    console.error('Error creating test participants:', error)
    return NextResponse.json(
      { error: 'Failed to create test participants' },
      { status: 500 }
    )
  }
}
