import { tool as createTool } from 'ai'
import { z } from 'zod'

export type WeatherToolResponse = {
  coord: { lon: number; lat: number }
  weather: { id: number; main: string; description: string; icon: string }[]
  base: string
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
    sea_level: number
    grnd_level: number
  }
  visibility: number
  wind: { speed: number; deg: number }
  clouds: { all: number }
  dt: number
  sys: {
    type: number
    id: number
    country: string
    sunrise: number
    sunset: number
  }
  timezone: number
  id: number
  name: string
  error?: {
    message: string
    location: string
    code: 'NOT_FOUND' | 'API_ERROR' | 'NETWORK_ERROR' | 'INVALID_DATA'
    suggestion?: string
  }
  cod: number
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
    const validResults = []
    const errorMessages = []

    for (const loc of locations) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=pt_br`,
        )
        const data: WeatherToolResponse = await response.json()

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

        const weatherMain = data.weather[0].main
        const temperature = data.main.temp

        validResults.push({
          ...data,
          weatherMain,
          temperature,
          minTemperature: data.main.temp_min,
          maxTemperature: data.main.temp_max,
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

    if (errorMessages.length > 0) {
      console.log(
        `Algumas cidades não foram encontradas: ${errorMessages.join(', ')}`,
      )
    }

    return validResults
  },
})

export const tools = {
  getWeather: weatherTool,
}
