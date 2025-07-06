import { tool as createTool } from 'ai'
import { z } from 'zod'

import { formatLocations } from '@/utils/format'

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

export type WeatherErrorResponse = {
  error: {
    title: string
    message: string
    location: string
    code: 'NOT_FOUND' | 'API_ERROR' | 'NETWORK_ERROR' | 'INVALID_DATA'
  }
}

async function fetchWeatherData(
  loc: string,
): Promise<WeatherToolResponse | WeatherErrorResponse> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=pt_br`,
    )
    const data = await response.json()

    let result: WeatherToolResponse | WeatherErrorResponse

    if (data.cod === 401) {
      result = {
        error: {
          title: 'Erro de autenticação',
          message: `Não foi possível acessar o serviço meteorológico. Por favor, tente novamente mais tarde.`,
          location: loc,
          code: 'API_ERROR',
        },
      }
    } else if (data.cod === 404 || data.cod !== 200) {
      result = {
        error: {
          title: 'Localização não encontrada',
          message: `Não foi possível encontrar dados para ${loc}. Verifique se o nome da cidade está correto.`,
          location: loc,
          code: 'NOT_FOUND',
        },
      }
    } else if (!data.weather || !data.weather[0] || !data.main) {
      result = {
        error: {
          title: 'Dados incompletos',
          message: `Os dados meteorológicos para ${loc} estão incompletos ou indisponíveis no momento. Por favor, tente novamente mais tarde.`,
          location: loc,
          code: 'INVALID_DATA',
        },
      }
    } else {
      result = {
        weather: [
          {
            main: data.weather[0].main,
            description: data.weather[0].description,
          },
        ],
        main: {
          temp: data.main.temp,
          feels_like: data.main.feels_like,
          temp_min: data.main.temp_min,
          temp_max: data.main.temp_max,
          humidity: data.main.humidity,
          pressure: data.main.pressure,
        },
        wind: {
          speed: data.wind?.speed || 0,
        },
        sys: {
          country: data.sys?.country || '',
        },
        name: data.name,
        cod: data.cod,
      }
    }
    return result
  } catch (error) {
    const errorResponse: WeatherErrorResponse = {
      error: {
        title: 'Erro de conexão',
        message: `Não foi possível conectar ao serviço meteorológico para obter dados de ${loc}. Verifique sua conexão e tente novamente.`,
        location: loc,
        code: 'NETWORK_ERROR',
      },
    }
    return errorResponse
  }
}

export const weatherTool = createTool({
  description: 'Disponibiliza a previsão do tempo para um ou mais locais',
  parameters: z.object({
    location: z
      .array(z.string())
      .describe('Os locais para obter a previsão do tempo'),
  }),
  execute: async function ({ location }) {
    if (location.length === 0) {
      console.log('[Weather] Nenhuma localização válida fornecida')
      return [
        {
          error: {
            title: 'Localização inválida',
            message: 'Nenhuma localização válida foi fornecida.',
            location: location.join(', ') || 'desconhecida',
            code: 'NOT_FOUND',
          },
        },
      ]
    }

    console.log('with joining', location.join(', '))

    console.log(
      `[Weather] Solicitação recebida para ${formatLocations(location)}`,
    )

    try {
      const promises = location.map((loc) => fetchWeatherData(loc))
      const results = await Promise.all(promises)

      if (results.length === 0) {
        return [
          {
            error: {
              title: 'Serviço indisponível',
              message:
                location.length === 1
                  ? `Não foi possível obter previsão do tempo para a localidade solicitada. Por favor, tente novamente mais tarde.`
                  : `Não foi possível obter previsão do tempo para nenhuma das localidades solicitadas. Por favor, tente novamente mais tarde.`,
              location: location.join(', '),
              code: 'API_ERROR',
            },
          },
        ]
      }

      return results
    } catch (error) {
      console.error('[Weather] Erro na execução principal:', error)
      return [
        {
          error: {
            title: 'Serviço indisponível',
            message:
              location.length === 1
                ? `Não foi possível obter previsão do tempo para ${location[0]}. Por favor, tente novamente mais tarde.`
                : `Não foi possível obter previsão do tempo para ${formatLocations(location)}. Por favor, tente novamente mais tarde.`,
            location: location.join(', '),
            code: 'API_ERROR',
          },
        },
      ]
    }
  },
})
