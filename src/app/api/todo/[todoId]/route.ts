import { NextRequest, NextResponse } from 'next/server'

import { getUserSession } from '../../user/profile/actions/get-user-session'
import { deleteTodoAction } from '../actions/delete-todo'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { todoId: string } },
) {
  const { todoId } = params
  const { session, error } = await getUserSession()

  if (error || !session) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Unauthorized' },
      { status: 401 },
    )
  }

  const { message, error: deleteError } = await deleteTodoAction({
    id: todoId,
    userId: session.user.id,
  })

  if (deleteError) {
    return NextResponse.json({ error: deleteError }, { status: 400 })
  }

  return NextResponse.json({ message }, { status: 200 })
}
