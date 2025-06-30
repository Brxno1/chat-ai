import { tool as createTool } from 'ai'
import { z } from 'zod'

type WeatherResponse = {
  cod: number
  weather: { main: string }[]
  main: { temp: number }
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
          `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`,
        )
        const data: WeatherResponse = await response.json()

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

        const weather = data.weather[0].main
        const temperature = data.main.temp

        results.push({ weather, temperature, location: loc })
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
