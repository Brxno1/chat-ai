export type User = {
  id: string
  name: string
  email: string
  emailVerified?: boolean | Date | null
  image?: string | null
  background?: string | null
  bio?: string | null
  createdAt: Date
  updatedAt: Date
}

export type Session = {
  session: {
    id: string
    token: string
    expiresAt: Date
    ipAddress?: string | null
    userAgent?: string | null
    userId: string
    createdAt: Date
    updatedAt: Date
  }
  user: User
}
