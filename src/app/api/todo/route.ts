import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getUserSession } from '../user/profile/actions/get-user-session'
import { createTodoAction } from './actions/create-todo'

const createTodoSchemaBody = z.object({
  title: z.string(),
})

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

// export async function DELETE(request: NextRequest) {
//   const session = await auth()

//   if (!session) {
//     return NextResponse.json(
//       { error: 'Unauthorized', message: 'Unauthorized' },
//       { status: 401 },
//     )
//   }

//   const id = request.headers.get('X-Todo-ID')

//   if (!id) {
//     return NextResponse.json(
//       { error: 'ID is required', message: 'ID is required' },
//       { status: 400 },
//     )
//   }

//   const response = await deleteTodoAction({
//     id,
//     userId: session.user.id,
//   })

//   if (response.error) {
//     return NextResponse.json(
//       { error: response.error, message: response.message },
//       { status: 400 },
//     )
//   }

//   return NextResponse.json({ status: 204 })
// }
