'use client'

import { useSearchParams } from 'next/navigation'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AccountForm } from './account-form'
import { LoginForm } from './login-form'

export function FormAuth() {
  const mode = useSearchParams().get('mode') || 'account'

  return (
    <Tabs defaultValue={mode} className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Criar conta</TabsTrigger>
        <TabsTrigger value="login">Entrar</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <AccountForm />
      </TabsContent>
      <TabsContent value="login">
        <LoginForm />
      </TabsContent>
    </Tabs>
  )
}
