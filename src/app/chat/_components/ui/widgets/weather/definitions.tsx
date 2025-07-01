import {
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Sun,
  Wind,
  Zap,
} from 'lucide-react'

export type WeatherCondition =
  | 'limpo'
  | 'chuva'
  | 'neve'
  | 'garoa'
  | 'tempestade'
  | 'vento'
  | 'padrao'

export type WeatherConfig = {
  icon: React.ReactNode
  gradient: string
}

export const weatherConfigs: Record<WeatherCondition, WeatherConfig> = {
  limpo: {
    icon: <Sun className="h-12 w-12 text-yellow-400 drop-shadow-sm" />,
    gradient: 'from-yellow-400 via-orange-300 to-orange-500',
  },
  chuva: {
    icon: <CloudRain className="h-12 w-12 text-blue-400 drop-shadow-sm" />,
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
  },
  neve: {
    icon: <CloudSnow className="h-12 w-12 text-blue-200 drop-shadow-sm" />,
    gradient: 'from-blue-100 via-blue-200 to-blue-300',
  },
  garoa: {
    icon: <CloudDrizzle className="h-12 w-12 text-blue-300 drop-shadow-sm" />,
    gradient: 'from-blue-300 via-blue-400 to-blue-500',
  },
  tempestade: {
    icon: <Zap className="h-12 w-12 text-purple-400 drop-shadow-sm" />,
    gradient: 'from-purple-500 via-purple-600 to-purple-700',
  },
  vento: {
    icon: <Wind className="h-12 w-12 text-gray-400 drop-shadow-sm" />,
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
  },
  padrao: {
    icon: <Cloud className="h-12 w-12 text-gray-400 drop-shadow-sm" />,
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
  },
}

export const TEMPERATURE_RANGES = [
  { min: 35, color: 'text-red-500', label: 'Muito quente' },
  { min: 28, color: 'text-orange-500', label: 'Quente' },
  { min: 22, color: 'text-green-500', label: 'Agradável' },
  { min: 16, color: 'text-teal-500', label: 'Fresco' },
  { min: 10, color: 'text-blue-500', label: 'Frio' },
  { min: 0, color: 'text-blue-600', label: 'Muito frio' },
  { min: -Infinity, color: 'text-blue-700', label: 'Extremamente frio' },
] as const

export const TEMP_SCALE_MIN = -10
export const TEMP_SCALE_MAX = 40

export const WEATHER_TRANSLATIONS: Record<string, string> = {
  clear: 'Céu limpo',
  sunny: 'Ensolarado',
  'partly cloudy': 'Parcialmente nublado',
  'mostly cloudy': 'Nublado',
  overcast: 'Encoberto',
  cloudy: 'Nublado',
  clouds: 'Nublado',
  rain: 'Chuva',
  'light rain': 'Chuva fraca',
  'moderate rain': 'Chuva moderada',
  'heavy rain': 'Chuva forte',
  shower: 'Pancada de chuva',
  drizzle: 'Garoa',
  snow: 'Neve',
  'light snow': 'Neve fraca',
  'heavy snow': 'Neve forte',
  sleet: 'Chuva com neve',
  thunderstorm: 'Tempestade',
  storm: 'Tempestade',
  windy: 'Ventoso',
  fog: 'Neblina',
  mist: 'Névoa',
}

export const getWeatherCondition = (weather: string): WeatherCondition => {
  const condition = weather.toLowerCase()

  if (
    condition.includes('clear') ||
    condition.includes('sunny') ||
    condition.includes('limpo') ||
    condition.includes('ensolarado')
  )
    return 'limpo'

  if (
    condition.includes('rain') ||
    condition.includes('rainy') ||
    condition.includes('chuva') ||
    condition.includes('chuvoso')
  )
    return 'chuva'

  if (
    condition.includes('snow') ||
    condition.includes('snowy') ||
    condition.includes('neve') ||
    condition.includes('nevando')
  )
    return 'neve'

  if (
    condition.includes('drizzle') ||
    condition.includes('garoa') ||
    condition.includes('chuvisco')
  )
    return 'garoa'

  if (
    condition.includes('storm') ||
    condition.includes('thunder') ||
    condition.includes('tempestade') ||
    condition.includes('trovão')
  )
    return 'tempestade'

  if (
    condition.includes('wind') ||
    condition.includes('vento') ||
    condition.includes('ventoso')
  )
    return 'vento'

  return 'padrao'
}

export const getTemperatureInfo = (temp: number) => {
  const range = TEMPERATURE_RANGES.find((r) => temp >= r.min)
  return {
    color: range?.color || 'text-blue-700',
    label: range?.label || 'Muito frio',
  }
}

export const calculateTemperaturePosition = (temp: number) => {
  const percentage =
    ((temp - TEMP_SCALE_MIN) / (TEMP_SCALE_MAX - TEMP_SCALE_MIN)) * 100
  return Math.max(0, Math.min(95, percentage))
}
