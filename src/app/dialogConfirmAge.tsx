'use client'

import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function AgeVerificationDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const ageConfirmed = Cookies.get('ageConfirmed')
    if (ageConfirmed !== 'true') {
      setOpen(true)
    }
  }, [])

  const handleConfirmAge = () => {
    Cookies.set('ageConfirmed', 'true', { expires: 7, path: '/' })
    setOpen(false)
  }

  const handleDeclineAge = () => {
    router.push('https://halpp.me')
    setOpen(false)
  }

  return (
    <Dialog open={open}>
      <DialogContent className="top-[20%] shadow-md shadow-zinc-600 sm:max-w-[425px]">
        <DialogHeader className="flex items-center">
          <DialogTitle>Você é maior de 18 anos?</DialogTitle>
          <DialogDescription className="text-center">
            Este conteúdo é destinado apenas a pessoas com mais de 18 anos. É
            importante que você confirme sua idade para acessar este material.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex items-center justify-around gap-4 border-t border-t-background py-4">
          <Button
            onClick={handleConfirmAge}
            variant="default"
            className="font-semibold"
          >
            Sim
          </Button>
          <Button
            onClick={handleDeclineAge}
            variant="ghost"
            className="font-semibold"
          >
            Não
          </Button>
        </div>
      </DialogContent>
      <div className="flex h-screen justify-center">
        <h1 className="text-2xl font-bold">HOME</h1>
      </div>
    </Dialog>
  )
}
