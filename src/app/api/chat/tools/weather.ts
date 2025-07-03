import { tool as createTool } from 'ai'
import { z } from 'zod'

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

export const weatherTool = createTool({
  description: 'Disponibiliza a previsão do tempo para um ou mais locais',
  parameters: z.object({
    location: z
      .array(z.string())
      .describe('Os locais para obter a previsão do tempo'),
  }),
  execute: async function ({ location }) {
    const locations = Array.isArray(location) ? location : [location]
    const validResults: (WeatherToolResponse | WeatherErrorResponse)[] = []
    const errorMessages: string[] = []

    for (const loc of locations) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=pt_br`,
        )
        const data = await response.json()

        if (data.cod === 401) {
          validResults.push({
            error: {
              title: 'Erro de autenticação',
              message: `Erro de autenticação com a API de previsão do tempo. Por favor, tente novamente mais tarde.`,
              location: loc,
              code: 'API_ERROR',
            },
          })
          continue
        }

        if (data.cod === 404 || data.cod !== 200) {
          validResults.push({
            error: {
              title: 'Localização não encontrada',
              message: `Localização "${loc}" não foi encontrada. Verifique o nome da cidade e tente novamente.`,
              location: loc,
              code: 'NOT_FOUND',
            },
          })
          continue
        }

        if (!data.weather || !data.weather[0] || !data.main) {
          validResults.push({
            error: {
              title: 'Dados de clima inconsistentes',
              message: `Dados de clima inconsistentes para "${loc}". Informações incompletas retornadas pela API.`,
              location: loc,
              code: 'INVALID_DATA',
            },
          })
          continue
        }

        validResults.push({
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
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao buscar dados'

        errorMessages.push(`"${loc}": ${errorMessage}`)
        validResults.push({
          error: {
            title: 'Erro de conexão',
            message: `Erro de conexão ao buscar dados para "${loc}": ${errorMessage}`,
            location: loc,
            code: 'NETWORK_ERROR',
          },
        })
      }
    }

    if (validResults.length === 0) {
      return [
        {
          error: {
            title: 'Erro ao obter a previsão do tempo',
            message: `Erro ao obter a previsão do tempo para todas as localidades solicitadas.`,
            location: locations.join(', '),
            code: 'API_ERROR',
          },
        },
      ]
    }

    return validResults
  },
})
