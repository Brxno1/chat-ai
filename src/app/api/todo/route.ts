import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/services/auth'

import { actionCreateTodo } from './actions/create-todo'

const CreateTodoSchemaBody = z.object({
  title: z.string(),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  const { id } = session!.user

  const body = await request.json()
  const { title } = CreateTodoSchemaBody.parse(body)

  const response = await actionCreateTodo({
    title,
    id,
  })

  if (response.error) {
    return NextResponse.json(
      { error: response.error, message: response.message },
      { status: 400 },
    )
  }

  return NextResponse.json(
    { message: response.message, todo: response.todo },
    { status: 200 },
  )
}
