import { env } from './env'

type Path = '/app' | '/auth' | '/'

export function getUrl(path: Path) {
  const baseUrl = env.NEXT_PUBLIC_APP_URL!

  return `${baseUrl}${path}`
}
