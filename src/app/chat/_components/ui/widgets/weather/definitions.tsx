import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  Cloudy,
  Eye,
  Sun,
  Wind,
  Zap,
} from 'lucide-react'

export type WeatherCondition =
  | 'clear'
  | 'clouds'
  | 'few_clouds'
  | 'mist'
  | 'rain'
  | 'snow'
  | 'drizzle'
  | 'thunderstorm'
  | 'wind'
  | 'atmosphere'
  | 'default'

export type WeatherConfig = {
  icon: React.ReactNode
  gradient: string
}

export const weatherConfigs: Record<WeatherCondition, WeatherConfig> = {
  clear: {
    icon: <Sun className="size-12 text-yellow-400 drop-shadow-sm" />,
    gradient: 'from-yellow-300 via-orange-300 to-orange-400',
  },
  clouds: {
    icon: <Cloudy className="size-12 text-gray-400/50 drop-shadow-sm" />,
    gradient: 'from-gray-400 via-gray-400 to-gray-300',
  },
  few_clouds: {
    icon: <CloudSun className="size-12 text-yellow-400 drop-shadow-sm" />,
    gradient: 'from-yellow-400 via-gray-300 to-gray-400',
  },
  mist: {
    icon: <CloudFog className="size-12 text-gray-200 drop-shadow-sm" />,
    gradient: 'from-gray-200 via-gray-300 to-gray-400',
  },
  rain: {
    icon: <CloudRain className="size-12 text-blue-400 drop-shadow-sm" />,
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
  },
  snow: {
    icon: <CloudSnow className="size-12 text-blue-200 drop-shadow-sm" />,
    gradient: 'from-blue-100 via-blue-200 to-blue-300',
  },
  drizzle: {
    icon: <CloudDrizzle className="size-12 text-blue-300 drop-shadow-sm" />,
    gradient: 'from-blue-300 via-blue-400 to-blue-500',
  },
  thunderstorm: {
    icon: <Zap className="size-12 text-purple-400 drop-shadow-sm" />,
    gradient: 'from-purple-500 via-purple-600 to-purple-700',
  },
  wind: {
    icon: <Wind className="size-12 text-gray-400 drop-shadow-sm" />,
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
  },
  atmosphere: {
    icon: <Eye className="size-12 text-amber-400 drop-shadow-sm" />,
    gradient: 'from-amber-300 via-orange-400 to-red-400',
  },
  default: {
    icon: <Cloud className="size-12 text-gray-200 drop-shadow-sm" />,
    gradient: 'from-blue-500 via-yellow-500 to-red-500',
  },
}

export const TEMPERATURE_RANGES: {
  min: number
  color: string
  label: string
}[] = [
  { min: 32, color: 'text-orange-500', label: 'Muito quente' },
  { min: 29, color: 'text-yellow-500', label: 'Quente' },
  { min: 22, color: 'text-green-500', label: 'Agradável' },
  { min: 19, color: 'text-teal-500', label: 'Fresco' },
  { min: 14, color: 'text-blue-500', label: 'Frio' },
  { min: 0, color: 'text-blue-600', label: 'Muito frio' },
  { min: -Infinity, color: 'text-blue-700', label: 'Extremamente frio' },
] as const

export const TEMP_SCALE_MIN = -10
export const TEMP_SCALE_MAX = 40

export const getWeatherCondition = (weather: string): WeatherCondition => {
  const condition = weather.toLowerCase()

  if (condition.includes('clear') || condition.includes('sunny')) return 'clear'

  if (
    condition.includes('fog') ||
    condition.includes('mist') ||
    condition.includes('haze') ||
    condition.includes('neblina')
  )
    return 'mist'

  if (
    condition.includes('partly cloudy') ||
    condition.includes('partly') ||
    condition.includes('few clouds')
  )
    return 'few_clouds'

  if (
    condition.includes('overcast') ||
    condition.includes('mostly cloudy') ||
    condition.includes('broken clouds') ||
    condition.includes('clouds')
  )
    return 'clouds'

  if (
    condition.includes('dust') ||
    condition.includes('sand') ||
    condition.includes('smoke') ||
    condition.includes('haze') ||
    condition.includes('atmosphere')
  )
    return 'atmosphere'

  if (condition.includes('rain') || condition.includes('rainy')) return 'rain'

  if (condition.includes('snow') || condition.includes('snowy')) return 'snow'

  if (condition.includes('drizzle')) return 'drizzle'

  if (condition.includes('storm') || condition.includes('thunder'))
    return 'thunderstorm'

  if (condition.includes('wind')) return 'wind'

  return 'default'
}

export const getTemperatureInfo = (temp: number) => {
  const range = TEMPERATURE_RANGES.find((range) => temp >= range.min)
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
