import { NextRequest, NextResponse } from 'next/server'

import { transcribeAudio } from '../services/transcribe-audio'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const audio = formData.get('audio') as File

  const MAX_FILE_SIZE = 5 * 1024 * 1024

  if (!audio) {
    return NextResponse.json({ error: 'Audio not found' }, { status: 400 })
  }

  if (audio.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'Audio file too large. Maximum size is 5MB.' },
      { status: 400 },
    )
  }

  const buffer = Buffer.from(await audio.arrayBuffer())

  const audioAsBase64 = buffer.toString('base64')

  const { transcription } = await transcribeAudio(audioAsBase64, audio.type)

  return NextResponse.json({ transcription })
}
