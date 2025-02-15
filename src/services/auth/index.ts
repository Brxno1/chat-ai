import { PrismaAdapter } from '@auth/prisma-adapter'
import { render } from '@react-email/components'
import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import nodemailer from 'nodemailer'

import { prisma } from '@/services/database/prisma'

import { Email } from '../email/index'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      server: {
        host: 'smtp.mailtrap.io',
        port: 587,
        auth: {
          user: process.env.MAILTRAP_USERNAME,
          pass: process.env.MAILTRAP_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({
        identifier: email,
        url,
        token,
        baseUrl,
        provider,
        expires,
        theme,
        request,
      }: any) => {
        const transporter = nodemailer.createTransport({
          host: process.env.MAILTRAP_HOST,
          port: 587,
          auth: {
            user: process.env.MAILTRAP_USERNAME,
            pass: process.env.MAILTRAP_PASSWORD,
          },
        })

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        })

        const emailHtml = await render(Email({ url, user }))

        const options = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `Olá, ${user?.name}`,
          html: emailHtml,
        }

        await transporter.sendMail(options)
      },
    }),
  ],
  pages: {
    error: '/auth',
    verifyRequest: '/auth',
    newUser: '/app',
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },

    async session({ session, token }: { session: any; token: any }) {
      if (session && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
  },
})
