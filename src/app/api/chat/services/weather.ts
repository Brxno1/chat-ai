import { tool as createTool } from 'ai'
import { z } from 'zod'

export const weatherTool = createTool({
  description: 'Exibe a previsão do tempo para um local',
  parameters: z.object({
    location: z.string().describe('O local para obter a previsão do tempo'),
  }),
  execute: async function ({ location }) {
    // Verificar se tem API key
    if (!process.env.OPENWEATHER_API_KEY) {
      // Mock data para teste
      const mockTemperature = Math.floor(Math.random() * 30) + 5
      const mockWeather = ['Clear', 'Cloudy', 'Rainy', 'Sunny'][
        Math.floor(Math.random() * 4)
      ]

      return {
        weather: mockWeather,
        temperature: mockTemperature,
        location,
      }
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`,
    )
    const data = await response.json()
    const weather = data.weather[0].main
    const temperature = data.main.temp

    return { weather, temperature, location }
  },
})

export const tools = {
  displayWeather: weatherTool,
}
