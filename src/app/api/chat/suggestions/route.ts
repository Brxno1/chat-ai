import { type Message } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

import { suggestQuestions } from '../services/suggest-questions'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { messages }: { messages: Message[] } = body

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 },
      )
    }

    const suggestions = await suggestQuestions(messages)

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Error in suggestions route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
