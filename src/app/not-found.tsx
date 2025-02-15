'use client'

import { useEffect, useState } from 'react'

export default function NotFound() {
  const [counter, setCounter] = useState(5)
  const [, setRedirecting] = useState(false)

  useEffect(() => {
    if (counter === 0) {
      setRedirecting(true)
      window.location.href = '/app'
    }
    const timer = setInterval(() => {
      setCounter((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [counter])

  return (
    <div className="flex h-screen flex-col items-center justify-center space-y-8">
      <h1 className="text-center text-4xl font-bold">Página não encontrada</h1>
      <p>
        Você será redirecionado em{' '}
        <span className="font-bold text-purple-400">{counter}</span> segundos...
      </p>
    </div>
  )
}
