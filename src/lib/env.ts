import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().default('http://localhost:5432'),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_REDIRECT_URI: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  EMAIL_SERVER: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  MAILTRAP_HOST: z.string().optional(),
  MAILTRAP_PORT: z.string().optional(),
  MAILTRAP_USERNAME: z.string().optional(),
  MAILTRAP_PASSWORD: z.string().optional(),
  MAILHOG_HOST: z.string().default('localhost'),
  MAILHOG_PORT: z.string().default('1025'),
  MAILHOG_UI: z.string().default('http://localhost:8025'),
  AUTH_SECRET: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_EMAIL_FROM: z.string().optional(),
  NEXT_PUBLIC_LOGO_TOKEN: z.string().optional(),
})

export const env = envSchema.parse(process.env)
