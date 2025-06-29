import {
  Cloud,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  MapPin,
  Sun,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react'

import { cn } from '@/utils/utils'

type WeatherCondition =
  | 'clear'
  | 'rain'
  | 'snow'
  | 'drizzle'
  | 'storm'
  | 'wind'
  | 'default'

type WeatherConfig = {
  icon: React.ReactNode
  gradient: string
}

const weatherConfigs: Record<WeatherCondition, WeatherConfig> = {
  clear: {
    icon: <Sun className="h-12 w-12 text-yellow-400" />,
    gradient: 'from-yellow-400 via-orange-300 to-orange-500',
  },
  rain: {
    icon: <CloudRain className="h-12 w-12 text-blue-400" />,
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
  },
  snow: {
    icon: <CloudSnow className="h-12 w-12 text-blue-200" />,
    gradient: 'from-blue-100 via-blue-200 to-blue-300',
  },
  drizzle: {
    icon: <CloudDrizzle className="h-12 w-12 text-blue-300" />,
    gradient: 'from-blue-300 via-blue-400 to-blue-500',
  },
  storm: {
    icon: <Zap className="h-12 w-12 text-purple-400" />,
    gradient: 'from-purple-500 via-purple-600 to-purple-700',
  },
  wind: {
    icon: <Wind className="h-12 w-12 text-gray-400" />,
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
  },
  default: {
    icon: <Cloud className="h-12 w-12 text-gray-400" />,
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
  },
}

const temperatureRanges = [
  { min: 30, color: 'text-red-500' },
  { min: 20, color: 'text-orange-500' },
  { min: 10, color: 'text-green-500' },
  { min: 0, color: 'text-blue-500' },
  { min: -Infinity, color: 'text-blue-700' },
]

const getWeatherCondition = (weather: string): WeatherCondition => {
  const condition = weather.toLowerCase()

  if (condition.includes('clear') || condition.includes('sunny')) return 'clear'
  if (condition.includes('rain') || condition.includes('rainy')) return 'rain'
  if (condition.includes('snow') || condition.includes('snowy')) return 'snow'
  if (condition.includes('drizzle')) return 'drizzle'
  if (condition.includes('storm') || condition.includes('thunder'))
    return 'storm'
  if (condition.includes('wind')) return 'wind'

  return 'default'
}

const getWeatherIcon = (weather: string) => {
  const condition = getWeatherCondition(weather)
  return weatherConfigs[condition].icon
}

const getWeatherGradient = (weather: string) => {
  const condition = getWeatherCondition(weather)
  return weatherConfigs[condition].gradient
}

const getTemperatureColor = (temp: number) => {
  const range = temperatureRanges.find((r) => temp >= r.min)
  return range?.color || 'text-blue-700'
}

type WeatherProps = {
  temperature: number
  weather: string
  location: string
}

export const Weather = ({ temperature, weather, location }: WeatherProps) => {
  const weatherIcon = getWeatherIcon(weather)
  const gradientClass = getWeatherGradient(weather)
  const tempColor = getTemperatureColor(temperature)

  return (
    <div className="relative min-w-[280px] max-w-[320px] overflow-hidden rounded-2xl border border-white/20 shadow-lg backdrop-blur-sm">
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-60',
          gradientClass,
        )}
      />

      <div className="relative space-y-4 p-6">
        <div className="flex items-center gap-1 text-sm font-medium text-foreground/80">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {weatherIcon}
            <div>
              <div
                className={cn('text-4xl font-bold tracking-tight', tempColor)}
              >
                {Math.round(temperature)}°
              </div>
              <div className="text-sm font-medium text-foreground/60">
                Celsius
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Thermometer className="h-4 w-4 text-foreground/60" />
          <span className="text-sm font-medium capitalize text-foreground/80">
            {weather}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-foreground/60">
            <span>Muito frio</span>
            <span>Muito quente</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500">
            <div
              className="h-full rounded-full bg-white shadow-sm transition-all duration-500"
              style={{
                width: '3px',
                marginLeft: `${Math.max(0, Math.min(95, ((temperature + 10) / 50) * 100))}%`,
                transform: 'translateX(-50%)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
