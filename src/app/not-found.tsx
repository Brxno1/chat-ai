'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import FuzzyText from '@/components/react-bits/FuzzyText/FuzzyText'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/')
    }, 1500)
    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="mx-auto flex h-screen flex-col items-center justify-center space-y-4">
      <FuzzyText fontSize="clamp(2rem, 8vw, 8rem)" fontWeight={900}>
        404
      </FuzzyText>
      <FuzzyText fontSize="clamp(2rem, 5vw, 8rem)" fontWeight={900}>
        Página não encontrada
      </FuzzyText>
    </div>
  )
}
