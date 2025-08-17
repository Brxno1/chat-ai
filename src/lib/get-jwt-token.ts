'use server'

import * as jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { decode } from 'next-auth/jwt'

export async function getJwtToken(): Promise<{ bearerToken: string } | null> {
  try {
    const cookieStore = await cookies()

    const sessionToken = cookieStore.get('authjs.session-token')?.value

    if (!sessionToken) {
      return null
    }

    const decoded = await decode({
      token: sessionToken,
      secret: process.env.AUTH_SECRET!,
      salt: 'authjs.session-token',
    })

    const bearerToken = jwt.sign(
      {
        sub: decoded?.id || decoded?.sub,
        email: decoded?.email,
        name: decoded?.name,
        bio: decoded?.bio,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.AUTH_SECRET!,
      { expiresIn: '7d' },
    )

    return { bearerToken }
  } catch {
    return null
  }
}
