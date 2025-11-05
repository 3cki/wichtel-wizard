import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationCode } from '@/lib/twilio'
import { checkRateLimit, getWaitTimeMinutes } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber } = body

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please use E.164 format (e.g., +491234567890)' },
        { status: 400 }
      )
    }

    // Check rate limit - 5 attempts per 15 minutes per phone number
    const rateLimitResult = checkRateLimit(`sms:${phoneNumber}`, {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimitResult.allowed) {
      const waitMinutes = getWaitTimeMinutes(rateLimitResult.resetTime)
      return NextResponse.json(
        {
          error: `Too many attempts. Please try again in ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''}.`,
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      )
    }

    // Send verification code via Twilio
    const result = await sendVerificationCode(phoneNumber)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send verification code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      remaining: rateLimitResult.remaining,
    })
  } catch (error) {
    console.error('Error in send-code API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
