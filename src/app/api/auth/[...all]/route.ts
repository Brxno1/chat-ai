import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '@/services/auth'

export const { POST, GET } = toNextJsHandler(auth)
