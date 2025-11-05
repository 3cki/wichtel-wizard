import { NextRequest, NextResponse } from 'next/server'
import { verifyCode } from '@/lib/twilio'
import { checkRateLimit, getWaitTimeMinutes } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, code } = body

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and code are required' },
        { status: 400 }
      )
    }

    // Validate code format (6 digits)
    const codeRegex = /^\d{6}$/
    if (!codeRegex.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format. Code must be 6 digits.' },
        { status: 400 }
      )
    }

    // Check rate limit - 10 attempts per 15 minutes per phone number
    // More attempts allowed for verification than sending to account for typos
    const rateLimitResult = checkRateLimit(`verify:${phoneNumber}`, {
      maxAttempts: 10,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimitResult.allowed) {
      const waitMinutes = getWaitTimeMinutes(rateLimitResult.resetTime)
      return NextResponse.json(
        {
          error: `Too many verification attempts. Please try again in ${waitMinutes} minute${waitMinutes > 1 ? 's' : ''}.`,
          resetTime: rateLimitResult.resetTime,
        },
        { status: 429 }
      )
    }

    // Verify code via Twilio
    const result = await verifyCode(phoneNumber, code)

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Invalid verification code',
          remaining: rateLimitResult.remaining,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
    })
  } catch (error) {
    console.error('Error in verify-code API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
