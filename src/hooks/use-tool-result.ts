import { ToolInvocation } from 'ai'

import { WeatherToolResponse } from '@/app/api/chat/tools/weather'
import { isWeatherResult, ToolInvocationResult } from '@/types/tool-results'

type ToolInvocationWithResult = ToolInvocation & { result: unknown }

export function useToolResult<T extends string = string>(
  toolInvocation: ToolInvocation,
  toolName: T,
) {
  if (
    toolInvocation.toolName !== toolName ||
    toolInvocation.state !== 'result'
  ) {
    return null
  }

  const invocation = toolInvocation as ToolInvocationWithResult
  const results = Array.isArray(invocation.result)
    ? invocation.result
    : [invocation.result]

  const typedResults = results as ToolInvocationResult<T>[]

  return {
    results: typedResults,
    hasResults: results.length > 0,
    hasErrors: results.some(
      (result: unknown) => (result as Record<string, unknown>)?.error,
    ),
    validResults: results.filter(
      (result: unknown) => result && !(result as Record<string, unknown>).error,
    ),
    errorResults: results.filter(
      (result: unknown) => (result as Record<string, unknown>)?.error,
    ),
  }
}

export function useWeatherResult(toolInvocation: ToolInvocation) {
  const invocation = toolInvocation as ToolInvocationWithResult
  const results = Array.isArray(invocation.result)
    ? invocation.result
    : [invocation.result]

  const weatherResults = results.filter(isWeatherResult)
  const errorResults = results.filter(
    (result: unknown) => (result as Record<string, unknown>)?.error,
  )

  const allResults: WeatherToolResponse[] = [
    ...weatherResults.filter((r) => !r.error),
    ...errorResults,
  ]

  return {
    hasWeatherData: weatherResults.length > 0,
    hasErrors: errorResults.length > 0,
    allResults,
  }
}
