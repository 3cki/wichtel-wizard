import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Test users for development only
const TEST_USERS = [
  { name: 'Test User 1', phoneNumber: '+491234567801' },
  { name: 'Test User 2', phoneNumber: '+491234567802' },
  { name: 'Test User 3', phoneNumber: '+491234567803' },
  { name: 'Test User 4', phoneNumber: '+491234567804' },
  { name: 'Test User 5', phoneNumber: '+491234567805' },
]

export async function GET(request: NextRequest) {
  // Only allow in development (never in production)
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test mode is disabled in production' },
      { status: 403 }
    )
  }

  try {
    // Create or get all test users
    const users = await Promise.all(
      TEST_USERS.map(async (testUser) => {
        let user = await prisma.user.findUnique({
          where: { phoneNumber: testUser.phoneNumber },
        })

        if (!user) {
          user = await prisma.user.create({
            data: testUser,
          })
        }

        return user
      })
    )

    return NextResponse.json({
      message: 'Test users ready',
      users: users.map(u => ({ id: u.id, name: u.name, phoneNumber: u.phoneNumber })),
    })
  } catch (error) {
    console.error('Error creating test users:', error)
    return NextResponse.json(
      { error: 'Failed to create test users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Only allow in development (never in production)
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test mode is disabled in production' },
      { status: 403 }
    )
  }

  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Check if it's a test user
    const testUser = TEST_USERS.find(u => u.phoneNumber === phoneNumber)
    if (!testUser) {
      return NextResponse.json(
        { error: 'Invalid test user' },
        { status: 400 }
      )
    }

    // Get or create the test user
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
    })

    if (!user) {
      user = await prisma.user.create({
        data: testUser,
      })
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, phoneNumber: user.phoneNumber },
    })
  } catch (error) {
    console.error('Error logging in test user:', error)
    return NextResponse.json(
      { error: 'Failed to login test user' },
      { status: 500 }
    )
  }
}
