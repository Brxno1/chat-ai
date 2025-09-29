import { type Message } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

import { suggestQuestions } from '../services/suggest-questions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { message }: { message: Message } = body

    if (!message) {
      return NextResponse.json(
        { error: 'No message provided' },
        { status: 400 },
      )
    }

    const suggestions = await suggestQuestions(message)

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Error in suggestions route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
