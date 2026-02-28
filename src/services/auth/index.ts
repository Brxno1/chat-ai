import { render } from '@react-email/components'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink } from 'better-auth/plugins'
import { headers } from 'next/headers'
import nodemailer from 'nodemailer'

import { env } from '@/lib/env'

import { prisma } from '../database/prisma'
import { Email } from '../email'

const transporter = nodemailer.createTransport({
  host: env.MAILHOG_HOST,
  port: parseInt(env.MAILHOG_PORT),
  auth: undefined,
})

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      bio: {
        type: 'string',
        required: false,
      },
      background: {
        type: 'string',
        required: false,
      },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        try {
          const user = await prisma.user.findUnique({
            where: { email },
          })

          if (!user) return

          const html = await render(Email({ url, user }))

          await transporter.sendMail({
            from: env.EMAIL_FROM,
            to: email,
            subject: `Olá, ${user.name}`,
            html,
          })
        } catch (error) {
          console.error('Erro ao enviar e-mail:', error)
        }
      },
    }),
  ],
})

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return session
}

export type AuthSession = typeof auth.$Infer.Session
