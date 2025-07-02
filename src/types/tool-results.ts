/* eslint-disable @typescript-eslint/no-explicit-any */

import { WeatherToolResponse } from '@/app/api/chat/tools/weather'

type BaseToolResult = {
  error?: string
  location?: string
}

interface SomeOtherToolResponse {
  someOtherProperty: string
}

export type ToolResult =
  | (WeatherToolResponse & BaseToolResult & { toolType: 'weather' })
  | (SomeOtherToolResponse & BaseToolResult & { toolType: 'other' })

export function isWeatherResult(
  result: any,
): result is WeatherToolResponse & BaseToolResult {
  return result && (result.weather || result.error)
}

export function isOtherToolResult(
  result: any,
): result is SomeOtherToolResponse & BaseToolResult {
  return result && result.someOtherProperty
}

export type ToolInvocationResult<T extends string> = T extends 'getWeather'
  ? WeatherToolResponse & BaseToolResult
  : T extends 'otherTool'
    ? SomeOtherToolResponse & BaseToolResult
    : unknown
