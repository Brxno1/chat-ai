'use client'

import { AlertCircle, AlertTriangle } from 'lucide-react'
import React from 'react'

interface WeatherErrorProps {
  location?: string
  error: string
  code?: 'NOT_FOUND' | 'API_ERROR' | 'NETWORK_ERROR' | 'INVALID_DATA'
}

type ErrorCode = NonNullable<WeatherErrorProps['code']>

interface ErrorDefinition {
  icon: React.ReactNode
  title: string
  tips: string[]
}

const errorDefinitions: Record<ErrorCode, ErrorDefinition> = {
  NETWORK_ERROR: {
    icon: (
      <AlertTriangle size={32} className="text-red-600 dark:text-red-500" />
    ),
    title: 'Erro de conexão',
    tips: [
      'Verifique sua conexão com a internet',
      'Tente novamente em alguns instantes',
      'Se o problema persistir, a API pode estar fora do ar',
    ],
  },
  API_ERROR: {
    icon: <AlertCircle size={32} className="text-red-600 dark:text-red-500" />,
    title: 'Erro ao buscar clima',
    tips: [
      'Tente novamente em alguns instantes',
      'Se o erro persistir, informe nosso suporte',
    ],
  },
  NOT_FOUND: {
    icon: <AlertCircle size={32} className="text-red-600 dark:text-red-500" />,
    title: 'Localização não encontrada',
    tips: [
      'Como está o clima em São Paulo?',
      'Verifique se a grafia está correta',
      'Evite incluir o nome do estado/país',
      'Para bairros, use a cidade principal',
    ],
  },
  INVALID_DATA: {
    icon: <AlertCircle size={32} className="text-red-600 dark:text-red-500" />,
    title: 'Dados de clima inconsistentes',
    tips: [
      'Tente novamente com outra localização',
      'Verifique se o nome está correto',
      'Se o problema persistir, informe nosso suporte',
    ],
  },
}

export const WeatherErrorCard = ({
  location,
  error,
  code = 'NOT_FOUND',
}: WeatherErrorProps) => {
  const errorInfo = errorDefinitions[code]

  return (
    <div
      className="mt-1 w-full min-w-[20rem] max-w-[20rem] overflow-hidden rounded-3xl border border-red-300/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:border-red-900/30"
      aria-live="polite"
      aria-label={`Erro ao buscar clima para ${location || 'localização'}: ${errorInfo.title}`}
      role="alert"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-red-100 via-red-200 to-red-300 opacity-50 transition-opacity duration-500 dark:from-red-950 dark:via-red-900 dark:to-red-800" />

      <div className="relative space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="animate-pulse" aria-hidden="true">
              {errorInfo.icon}
            </div>
            <h3 className="font-bold tracking-tight text-red-700 dark:text-red-400">
              {errorInfo.title}
            </h3>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-300/50 bg-red-200 p-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-800/20 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex flex-col space-y-1 rounded-xl border border-red-300/50 bg-red-200 p-2 text-red-700 dark:border-red-900/50 dark:bg-red-800/20 dark:text-red-300">
          <div className="flex items-center gap-1 font-medium text-red-700 dark:text-red-400">
            <span className="text-sm">💡 Dicas para melhor resultado</span>
          </div>
          {errorInfo.tips.map((tip, idx) => (
            <span key={idx} className="text-xs">
              • {tip}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
