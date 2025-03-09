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
      authorization: {
        params: {
          redirect_uri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI,
        },
      },
    }),
    EmailProvider({
      server: {
        host: process.env.MAILHOG_HOST || "localhost",
        port: parseInt(process.env.MAILHOG_PORT || "1025"),
        auth: undefined,
      },
      from: process.env.EMAIL_FROM,
      maxAge: 60 * 60 * 24, // 24 hours
      sendVerificationRequest: async ({
        identifier: email,
        url,
      }) => {
        try {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user) {
            return;
          }

          const emailHtml = await render(Email({ url, user }));

          const transporter = nodemailer.createTransport({
            host: process.env.MAILHOG_HOST || "localhost",
            port: parseInt(process.env.MAILHOG_PORT || "1025"),
            auth: undefined,
          });

          const options = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Olá, ${user.name}`,
            html: emailHtml,
          };

          await transporter.sendMail(options);
          console.log(`Email enviado para: ${email}`);
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

    async signIn({ user }: { user: any }) {
      return user
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