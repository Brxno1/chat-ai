import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { auth } from '@/services/auth'

import { actionCreateTodo } from './actions/create-todo'
import { actionDeleteTodos } from './actions/delete-todos'

const CreateTodoSchemaBody = z.object({
  title: z.string(),
})

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Unauthorized' },
      { status: 401 },
    )
  }

  const body = await request.json()
  const { title } = CreateTodoSchemaBody.parse(body)

  const response = await actionCreateTodo({
    title,
    id: session.user.id,
  })

  if (response.error) {
    return NextResponse.json(
      { error: response.error, message: response.error.message },
      { status: 400 },
    )
  }

  return NextResponse.json({ todo: response.todo }, { status: 200 })
}

// export async function GET(request: NextRequest) {
//   try {
//     const userId = request.headers.get('X-user-ID')

//     if (!userId) {
//       return NextResponse.json(
//         { error: 'User ID is required' },
//         { status: 400 },
//       )
//     }

//     const response = await actionGetTodos()

//     if (!response) {
//       return NextResponse.json(
//         { error: 'No todos found', message: 'No todos found' },
//         { status: 404 },
//       )
//     }

//     return NextResponse.json(response, { status: 200 })
//   } catch (error) {
//     console.error('Erro na API Route:', error)
//     return NextResponse.json(
//       { error: 'Internal server error', message: 'Erro ao buscar os todos' },
//       { status: 500 },
//     )
//   }
// }

export async function DELETE(request: NextRequest) {
  const session = await auth()

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Unauthorized' },
      { status: 401 },
    )
  }

  const id = request.headers.get('X-Todo-ID')

  if (!id) {
    return NextResponse.json(
      { error: 'ID is required', message: 'ID is required' },
      { status: 400 },
    )
  }

  const response = await actionDeleteTodos({
    id,
    userId: session.user.id,
  })

  if (response.error) {
    return NextResponse.json(
      { error: response.error, message: response.message },
      { status: 400 },
    )
  }

  return NextResponse.json({ status: 204 })
}
