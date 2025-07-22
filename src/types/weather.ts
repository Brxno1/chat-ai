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
  error?: null
}

export type WeatherErrorResponse = {
  error: {
    title: string
    message: string
    location: string
    code: 'NOT_FOUND' | 'API_ERROR' | 'NETWORK_ERROR' | 'INVALID_DATA'
  }
}
