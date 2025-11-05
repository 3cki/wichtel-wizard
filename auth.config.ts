import type { NextAuthConfig } from 'next-auth'
import Resend from 'next-auth/providers/resend'

export default {
  providers: [
    Resend({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
} satisfies NextAuthConfig
