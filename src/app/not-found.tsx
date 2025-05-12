'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useSessionStore } from '@/store/user-store'

export default function NotFound() {
  const { user } = useSessionStore()
  const router = useRouter()

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      router.replace(user ? '/dashboard' : '/auth')
    }, 1500)

    return () => clearTimeout(redirectTimeout)
  }, [router, user])

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-8">
      <h1 className="max-w-xl text-balance text-center text-4xl font-bold">
        {user
          ? `Oops, ${user.name}! Essa página não existe, qual tal você voltar?`
          : 'Redirecionando para /auth'}
      </h1>
      <p className="animate-pulse text-center">
        Redirecionando para {user ? '/dashboard' : '/auth'}
      </p>
    </div>
  )
}
