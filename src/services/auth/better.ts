import { render } from '@react-email/components'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { magicLink } from 'better-auth/plugins'
import nodemailer from 'nodemailer'

import { getUserByEmail } from '@/app/api/login/actions/get-user-by-email'
import { env } from '@/lib/env'

import { prisma } from '../database/prisma'
import { Email } from '../email/'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID as string,
      clientSecret: env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        try {
          const { user } = await getUserByEmail({ email })

          if (!user) {
            return
          }

          const html = await render(Email({ url, user }))

          const transporter = nodemailer.createTransport({
            host: env.MAILHOG_HOST,
            port: parseInt(env.MAILHOG_PORT),
            auth: undefined,
          })

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
