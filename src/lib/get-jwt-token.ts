'use server'

import * as jwt from 'jsonwebtoken'
import { decode } from 'next-auth/jwt'

type TokenCache = {
  token: string
  expiresAt: number
  sessionTokenHash: string
}

const tokenCache = new Map<string, TokenCache>()

function createSessionHash(sessionToken: string): string {
  return Buffer.from(sessionToken).toString('base64').slice(0, 16)
}

function isTokenValid(cached: TokenCache): boolean {
  return Date.now() < cached.expiresAt
}

export async function getJwtToken(
  value?: string,
): Promise<{ token: string | null }> {
  if (!value) return { token: null }

  try {
    const sessionHash = createSessionHash(value)
    const cached = tokenCache.get(sessionHash)

    if (cached && isTokenValid(cached)) {
      return { token: cached.token }
    }

    const decoded = await decode({
      token: value,
      secret: process.env.AUTH_SECRET!,
      salt: 'authjs.session-token',
    })

    if (!decoded) return { token: null }

    const now = Math.floor(Date.now() / 1000)
    const expiresIn = 7 * 24 * 60 * 60

    const token = jwt.sign(
      {
        sub: decoded.id || decoded.sub,
        email: decoded.email,
        name: decoded.name,
        iat: now,
      },
      process.env.AUTH_SECRET!,
      { expiresIn: '7d' },
    )

    tokenCache.set(sessionHash, {
      token,
      expiresAt: (now + expiresIn - 300) * 1000,
      sessionTokenHash: sessionHash,
    })

    return { token }
  } catch {
    return { token: null }
  }
}
