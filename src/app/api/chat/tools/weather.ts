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
  cod: number
}

export const weatherTool = createTool({
  description: 'Exibe a previsão do tempo para um ou mais locais',
  parameters: z.object({
    location: z
      .array(z.string())
      .describe('Os locais para obter a previsão do tempo'),
  }),
  execute: async function ({ location }) {
    const locations = Array.isArray(location) ? location : [location]
    const results = []

    for (const loc of locations) {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=pt_br`,
        )
        const data: WeatherToolResponse = await response.json()
        console.log('data in weather tool', data)

        if (
          data.cod !== 200 ||
          !data.weather ||
          !data.weather[0] ||
          !data.main
        ) {
          results.push({
            error: `Cidade "${loc}" não encontrada ou dados indisponíveis`,
            location: loc,
          })
          continue
        }

        const weatherMain = data.weather[0].main
        const temperature = data.main.temp

        results.push({
          ...data,
          weatherMain,
          temperature,
          minTemperature: data.main.temp_min,
          maxTemperature: data.main.temp_max,
          location: loc,
        })
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido'
        results.push({
          error: `Erro ao buscar clima para "${loc}": ${errorMessage}`,
          location: loc,
        })
      }
    }

    return results
  },
})

export const tools = {
  displayWeather: weatherTool,
}
