'use client'

import { useSearchParams } from 'next/navigation'
import React from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useEmailStore } from '@/hooks/use-email-store'

import { AccountForm } from './account-form'
import { LoginForm } from './login-form'

export function FormAuth() {
  const mode = useSearchParams().get('mode') || 'account'
  const name = useSearchParams().get('name') || ''

  const { setEmail } = useEmailStore()

  const triggerAccountRef = React.useRef<HTMLButtonElement>(null)

  const handleChangeModeToAccount = (email: string) => {
    triggerAccountRef.current?.focus()
    setEmail(email)
  }

  return (
    <Tabs defaultValue={mode} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account" ref={triggerAccountRef}>
          Criar conta
        </TabsTrigger>
        <TabsTrigger value="login">Entrar</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <AccountForm />
      </TabsContent>
      <TabsContent value="login">
        <LoginForm name={name} onChangeMode={handleChangeModeToAccount} />
      </TabsContent>
    </Tabs>
  )
}
