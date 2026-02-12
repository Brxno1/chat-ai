import {
  isWeatherResult,
  ToolInvocationResult,
  ToolName,
} from '@/types/tool-results'
import { WeatherToolResponse } from '@/types/weather'

type ToolInvocationPart = {
  type: string
  toolCallId: string
  toolName: string
  state: string
  output?: unknown
}

type ToolInvocationWithResult = ToolInvocationPart & { output: unknown }

export function useToolResult<T extends ToolName>(
  toolInvocation: ToolInvocationPart,
  toolName: T,
) {
  if (
    toolInvocation.toolName !== toolName ||
    toolInvocation.state !== 'result'
  ) {
    return null
  }

  const invocation = toolInvocation as ToolInvocationWithResult
  const results = Array.isArray(invocation.output)
    ? invocation.output
    : [invocation.output]

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

export function useWeatherResult(toolInvocation: ToolInvocationPart) {
  const invocation = toolInvocation as ToolInvocationWithResult
  const results = Array.isArray(invocation.output)
    ? invocation.output
    : [invocation.output]

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
