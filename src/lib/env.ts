import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().default('http://localhost:5432'),
  NEXT_PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  NEXT_PUBLIC_GOOGLE_REDIRECT_URI: z.string(),
  OPENAI_API_KEY: z.string(),
  EMAIL_SERVER: z.string(),
  EMAIL_FROM: z.string(),
  MAILTRAP_HOST: z.string(),
  MAILTRAP_USERNAME: z.string(),
  MAILTRAP_PASSWORD: z.string(),
  MAILHOG_HOST: z.string().default('localhost'),
  MAILHOG_PORT: z.string().default('1025'),
  MAILHOG_UI: z.string().default('http://localhost:8025'),
  AUTH_SECRET: z.string(),
})

export const env = envSchema.parse(process.env)
