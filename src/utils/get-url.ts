import { env } from '../lib/env'

type Path = '/' | '/auth' | '/dashboard' | '/chat'

const PATHS_ALLOWED: Path[] = ['/', '/auth', '/dashboard', '/chat']

export function getUrl(path: Path): string {
  if (!PATHS_ALLOWED.includes(path)) {
    throw new Error(`Invalid path: ${path}`)
  }

  if (!path.startsWith('/')) {
    throw new Error(`Path must start with /: ${path}`)
  }

  const baseUrl = env.NEXT_PUBLIC_APP_URL!

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured')
  }

  return `${baseUrl}${path}`
}
