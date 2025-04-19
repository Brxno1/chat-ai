import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string | null
      background?: string | null
      bio?: string | null
      createdAt?: Date | null
      updatedAt?: Date | null
    }
  }

  interface User {
    background?: string | null
    bio?: string | null
    createdAt?: Date | null
    updatedAt?: Date | null
  }

  interface JWT {
    id: string
    background?: string | null
    bio?: string | null
    createdAt?: Date | null
    updatedAt?: Date | null
  }
}
