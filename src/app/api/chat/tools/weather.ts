import { tool as createTool } from 'ai'
import { z } from 'zod'

import { api } from '@/lib/axios'
import type { WeatherErrorResponse, WeatherToolResponse } from '@/types/weather'
import { formatLocations } from '@/utils/format'

async function fetchWeatherData(
  loc: string,
): Promise<WeatherToolResponse | WeatherErrorResponse> {
  try {
    const { data } = await api.get<WeatherToolResponse>(
      `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=pt_br`,
    )

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
    }

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
