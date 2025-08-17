import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    bio?: string | null
    background?: string | null
    createdAt?: Date | null
    updatedAt?: Date | null
  }

  interface Session {
    accessToken?: string
    user: {
      id: string
      bio?: string | null
      background?: string | null
      createdAt: Date
      updatedAt: Date
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    bio?: string | null
    background?: string | null
    createdAt?: Date
    updatedAt?: Date
    raw?: string
  }
}
