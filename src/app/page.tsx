import { cookies } from 'next/headers'

import { UserProvider } from '@/context/user-provider'
import { auth } from '@/services/auth'
import { UserStoreProvider } from '@/store/user-setter'

import { Chat } from './app/(home)/_components/_chat/chat-ai'

export default async function Home() {
  const session = await auth()

  const cookieStore = await cookies()
  const aiModel = cookieStore.get('aiModel')

  return (
    <UserProvider user={session?.user || null}>
      <div className="flex h-screen w-full items-center justify-center">
        <Chat modelName={aiModel?.value || 'AI'} user={session?.user || null} />
      </div>
      <UserStoreProvider user={session?.user || null} />
    </UserProvider>
  )
}
