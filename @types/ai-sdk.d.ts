import '@ai-sdk/react'

import { ToolResult } from 'ai'

interface ToolInvocation {
  toolCallId: string
  toolName: string
  args: Record<string, unknown>
  state: 'call' | 'result'
  callTimestamp: number
  resultTimestamp?: number
  result: unknown | unknown[] | null
}

export type WeatherToolResponse = {
  weather: [{ main: string; description: string }]
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    humidity: number
    pressure: number
  }
  wind: { speed: number }
  sys: { country: string }
  name: string
  cod: number
  error?: {
    title: string
    message: string
    location: string
    code: 'NOT_FOUND' | 'API_ERROR' | 'NETWORK_ERROR' | 'INVALID_DATA'
  }
}

interface ToolResultTypes {
  getWeather: WeatherToolResponse[] | WeatherToolResponse
}

export type TextUIPart = { type: 'text'; text: string }
export type ReasoningUIPart = { type: 'reasoning'; reasoning: string }
export type ToolInvocationUIPart = {
  type: 'tool-invocation'
  toolInvocation: ToolInvocation
}
export type SourceUIPart = { type: 'source'; source: Source }
export type ToolResultUIPart = { type: 'tool-result'; toolResult: ToolResult }

export type MessagePart =
  | TextUIPart
  | ReasoningUIPart
  | ToolInvocationUIPart
  | SourceUIPart
  | ToolResultUIPart

declare module '@ai-sdk/react' {
  interface Message {
    parts?: MessagePart[]
  }
}
