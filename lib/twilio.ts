import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const verifyServiceSid = process.env.TWILIO_AUTH_SERVICE_ID!
const senderPhoneNumber = process.env.TWILIO_SENDER_PHONE!

if (!accountSid || !authToken || !verifyServiceSid || !senderPhoneNumber) {
  throw new Error('Missing Twilio credentials in environment variables')
}

const client = twilio(accountSid, authToken)

export async function sendVerificationCode(phoneNumber: string) {
  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
      })

    return {
      success: true,
      status: verification.status,
    }
  } catch (error) {
    console.error('Error sending verification code:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send verification code',
    }
  }
}

export async function verifyCode(phoneNumber: string, code: string) {
  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: code,
      })

    return {
      success: verificationCheck.status === 'approved',
      status: verificationCheck.status,
    }
  } catch (error) {
    console.error('Error verifying code:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify code',
    }
  }
}

export async function sendSMS(to: string, message: string) {
  try {
    // In development mode, log instead of sending (useful for testing with one phone number)
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.SMS_TEST_MODE === 'true'

    if (isDevelopment) {
      console.log('📱 SMS (TEST MODE - not sent):', {
        to,
        message,
        timestamp: new Date().toISOString(),
      })
      return {
        success: true,
        messageSid: 'test-mode-' + Date.now(),
      }
    }

    const result = await client.messages.create({
      body: message,
      from: senderPhoneNumber,
      to: to,
    })

    return {
      success: true,
      messageSid: result.sid,
    }
  } catch (error) {
    console.error('Error sending SMS:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send SMS',
    }
  }
}
