import '@ai-sdk/react'

import { Source, ToolInvocation, ToolResult } from 'ai'

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

declare module '@ai-sdk/react' {
  interface Message {
    parts?: Array<
      | { type: 'text'; text: string }
      | { type: 'reasoning'; reasoning: string }
      | { type: 'tool-invocation'; toolInvocation: ToolInvocation }
      | { type: 'source'; source: Source }
      | { type: 'tool-result'; toolResult: ToolResult }
    >
  }
}
