'use server'

import * as jwt from 'jsonwebtoken'

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

    // Better Auth uses session tokens stored in cookies,
    // we create a JWT from the session token for external use
    const now = Math.floor(Date.now() / 1000)
    const expiresIn = 7 * 24 * 60 * 60

    const token = jwt.sign(
      {
        sessionToken: value,
        iat: now,
      },
      process.env.BETTER_AUTH_SECRET!,
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
