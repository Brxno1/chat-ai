/* eslint-disable */

import type { NewsToolResponse } from '@/types/news'
import type { WeatherToolResponse } from '@/app/api/chat/tools/weather'

type BaseToolResult = {
  error?: string
  location?: string
}

interface SomeOtherToolResponse {
  someOtherProperty: string
}

export type ToolResult =
  | (WeatherToolResponse & BaseToolResult & { toolType: 'weather' })
  | (NewsToolResponse & BaseToolResult & { toolType: 'news' })
  | (SomeOtherToolResponse & BaseToolResult & { toolType: 'other' })

export function isWeatherResult(
  result: any,
): result is WeatherToolResponse & BaseToolResult {
  return result && (result.weather || result.error)
}

export function isNewsResult(result: any): result is NewsToolResponse & BaseToolResult {
  return result && ((result.title && result.url) || (result.error && result.error.topic))
}

export function isOtherToolResult(
  result: any,
): result is SomeOtherToolResponse & BaseToolResult {
  return result && result.someOtherProperty
}

export type ToolInvocationResult<
  T extends 'getWeather' | 'otherTool' | 'getNews',
> = {
  toolCallId: string
  toolName: T
  state: 'call' | 'result'
  args: T extends 'getWeather'
  ? { location: string[] }
  : T extends 'getNews'
  ? { topic: string; limit?: number }
  : T extends 'otherTool'
  ? { someArg: string }
  : Record<string, unknown>

  result: T extends 'getWeather'
  ? WeatherToolResponse[]
  : T extends 'getNews'
  ? NewsToolResponse[]
  : T extends 'otherTool'
  ? SomeOtherToolResponse[]
  : unknown[]
}
