import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/services/auth'

import { actionCreateTodo } from './actions/create-todo'
import { actionDeleteTodos } from './actions/delete-todos'
import { actionGetTodos } from './actions/get-todos'

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

export async function GET() {
  const response = await actionGetTodos()

  if (!response) {
    return NextResponse.json(
      { error: 'No todos found', message: 'No todos found' },
      { status: 400 },
    )
  }

  return NextResponse.json(response, { status: 200 })
}

const schemaDeleteBody = z.object({
  id: z.string(),
})

export async function DELETE(request: NextRequest) {
  const body = await request.json()
  const { id } = schemaDeleteBody.parse(body)

  const response = await actionDeleteTodos(id)

  if (response.error) {
    return NextResponse.json(
      { error: response.error, message: response.message },
      { status: 400 },
    )
  }

  return NextResponse.json({ status: 204 })
}
