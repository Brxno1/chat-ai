import { PrismaAdapter } from '@auth/prisma-adapter'
import { render } from '@react-email/components'
import NextAuth, { Session } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import nodemailer from 'nodemailer'
import { JWT } from 'next-auth/jwt'
import sgMail from '@sendgrid/mail'

import { prisma } from '@/services/database/prisma'

import { Email } from '../email/'
import { env } from '@/lib/env'
import { getUserByEmail } from '@/app/api/login/actions/get-user-by-email'
import { User } from 'next-auth'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  trustHost: true,
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
    {
      id: "email",
      type: "email",
      name: "Email",
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

          const html = await render(Email({ url, user }));

          const msg = {
            to: email,
            from: env.EMAIL_FROM || 'Bruno-bruno14dev@gmail.com',
            subject: `Olá, ${user.name}`,
            html,
          };

          await sgMail.send(msg);
        } catch (error) {
          console.error('Erro ao enviar e-mail:', error);
        }
      },
    }
  ],

  pages: {
    error: '/auth',
    verifyRequest: '/auth',
    newUser: '/dashboard',
  },

  session: {
    strategy: 'jwt',
  },

  secret: env.AUTH_SECRET,

  callbacks: {
    async jwt({ token, user, trigger, session }: {
      token: JWT;
      user: User;
      trigger?: 'signIn' | 'update' | 'signUp';
      session?: any;
    }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.bio = user.bio
        token.image = user.image
        token.background = user.background
        token.createdAt = user.createdAt
        token.updatedAt = user.updatedAt
      }

      if (trigger === 'update' && session) {
        return {
          ...token,
          ...session.data
        }
      }

      return token
    },

    async signIn({ user }) {
      if (user) {
        const data = await getUserByEmail({ email: user.email as string })

        if (data.error) {
          return false
        }
      }

      return true
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session && token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          bio: token.bio as string | null,
          image: token.image as string | null,
          background: token.background as string | null,
          createdAt: token.createdAt as Date,
          updatedAt: token.updatedAt as Date
        }
      }
      return session
    },
  },
})