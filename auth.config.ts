import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { verifyCode } from '@/lib/twilio'
import { prisma } from '@/lib/prisma'

export default {
  providers: [
    Credentials({
      id: 'phone',
      name: 'Phone Number',
      credentials: {
        phoneNumber: { label: "Phone Number", type: "text" },
        code: { label: "Verification Code", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.code) return null

        // Verify the code with Twilio
        const result = await verifyCode(
          credentials.phoneNumber as string,
          credentials.code as string
        )

        if (!result.success) {
          return null
        }

        // Find or create user in database
        let user = await prisma.user.findUnique({
          where: { phoneNumber: credentials.phoneNumber as string },
        })

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              phoneNumber: credentials.phoneNumber as string,
              name: (credentials.name as string) || null,
            },
          })
        } else if (credentials.name && user.name !== credentials.name) {
          // Update name if provided and different
          user = await prisma.user.update({
            where: { id: user.id },
            data: { name: credentials.name as string },
          })
        }

        return {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phoneNumber = (user as any).phoneNumber
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).phoneNumber = token.phoneNumber
      }
      return session
    },
  },
} satisfies NextAuthConfig
