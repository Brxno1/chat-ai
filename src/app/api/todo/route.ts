import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getUserSession } from '../user/profile/actions/get-user-session'
import { createTodoAction } from './actions/create-todo'
import { getTodosAction } from './actions/get-todos'

const createTodoSchemaBody = z.object({
  title: z.string(),
})

export async function GET() {
  try {
    const { todos, error, unauthorized } = await getTodosAction()

    if (unauthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error && !unauthorized) {
      return NextResponse.json({ error, message: error }, { status: 500 })
    }

    if (!todos || todos.length === 0) {
      return NextResponse.json({ message: 'No todos found' }, { status: 204 })
    }

    return NextResponse.json(todos, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error fetching todos', message: String(error) },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  const { session, error } = await getUserSession()

  if (error) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Unauthorized' },
      { status: 401 },
    )
  }

  const body = await request.json()
  const { title } = createTodoSchemaBody.parse(body)

  const { todo, error: createTodoError } = await createTodoAction({
    title,
    userId: session!.user.id,
  })

  if (createTodoError) {
    return NextResponse.json({ error: createTodoError }, { status: 400 })
  }

  return NextResponse.json({ todo }, { status: 200 })
}
