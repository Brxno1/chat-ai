import { NextResponse } from 'next/server'

import { actionDeleteTodos } from './actions/delete-todos'
import { actionGetTodos } from './actions/get-todos'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json(
      { error: 'ID is required', message: 'ID is required' },
      { status: 400 },
    )
  }

  try {
    const response = await actionGetTodos({ id })

    if (!response) {
      return NextResponse.json(
        { error: 'No todos found', message: 'No todos found' },
        { status: 404 },
      )
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Erro na API Route:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Erro ao buscar os todos' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json(
      { error: 'ID is required', message: 'ID is required' },
      { status: 400 },
    )
  }

  const response = await actionDeleteTodos(id)

  if (response.error) {
    return NextResponse.json(
      { error: response.error, message: response.message },
      { status: 400 },
    )
  }

  return NextResponse.json({ status: 204 })
}
