import { PrismaAdapter } from '@auth/prisma-adapter'
import { render } from '@react-email/components'
import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import nodemailer from 'nodemailer'

import { prisma } from '@/services/database/prisma'

import { Email } from '../email/'
import { env } from '@/lib/env'
import { getUserByEmail } from '@/app/api/login/actions/get-user-by-email'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          redirect_uri: env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
        },
      },
    }),
    EmailProvider({
      server: {
        host: env.MAILHOG_HOST,
        port: parseInt(env.MAILHOG_PORT),
        auth: undefined,
      },
      from: env.EMAIL_FROM,
      maxAge: 60 * 60 * 24, // 24 hours
      sendVerificationRequest: async ({
        identifier: email,
        url,
      }) => {
        try {
          const { user } = await getUserByEmail({ email })

          if (!user) {
            return;
          }

          const emailHtml = await render(Email({ url, user }));

          const transporter = nodemailer.createTransport({
            host: env.MAILHOG_HOST,
            port: parseInt(env.MAILHOG_PORT),
            auth: undefined,
          });

          const options = {
            from: env.EMAIL_FROM,
            to: email,
            subject: `Olá, ${user.name}`,
            html: emailHtml,
          };

          await transporter.sendMail(options);
        } catch (error) {
          if (error instanceof Error) {
            console.error(`Erro ao enviar email: ${error.message}`);
          } else {
            console.error(`Erro ao enviar email: ${String(error)}`);
          }
        }
      },
    })
  ],

  pages: {
    error: '/auth',
    verifyRequest: '/auth',
    newUser: '/app',
  },

  session: {
    strategy: 'jwt',
  },

  secret: env.AUTH_SECRET,

  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },

    async signIn() {
      return true
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