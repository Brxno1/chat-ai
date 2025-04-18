'use client'

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const session = useSession()
  const router = useRouter()

  const [counter, setCounter] = useState(5)

  useEffect(() => {
    if (counter <= 0) {
      router.push(session.data?.user ? '/app' : '/auth')
    }

    const timer = setInterval(() => {
      setCounter((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    document.title = `Página não encontrada`
    return () => clearInterval(timer)
  }, [counter])

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-8">
      <h1 className="text-center text-4xl font-bold">Página não encontrada</h1>
      <p>
        Você será redirecionado em{' '}
        <span className="font-bold text-purple-500">{counter}</span> segundos...
      </p>
    </div>
  )
}
