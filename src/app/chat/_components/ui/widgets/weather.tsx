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
import { useMemo } from 'react'

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
    icon: <Sun className="h-12 w-12 text-yellow-400 drop-shadow-sm" />,
    gradient: 'from-yellow-400 via-orange-300 to-orange-500',
  },
  rain: {
    icon: <CloudRain className="h-12 w-12 text-blue-400 drop-shadow-sm" />,
    gradient: 'from-blue-400 via-blue-500 to-blue-600',
  },
  snow: {
    icon: <CloudSnow className="h-12 w-12 text-blue-200 drop-shadow-sm" />,
    gradient: 'from-blue-100 via-blue-200 to-blue-300',
  },
  drizzle: {
    icon: <CloudDrizzle className="h-12 w-12 text-blue-300 drop-shadow-sm" />,
    gradient: 'from-blue-300 via-blue-400 to-blue-500',
  },
  storm: {
    icon: <Zap className="h-12 w-12 text-purple-400 drop-shadow-sm" />,
    gradient: 'from-purple-500 via-purple-600 to-purple-700',
  },
  wind: {
    icon: <Wind className="h-12 w-12 text-gray-400 drop-shadow-sm" />,
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
  },
  default: {
    icon: <Cloud className="h-12 w-12 text-gray-400 drop-shadow-sm" />,
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
  },
}

const TEMPERATURE_RANGES = [
  { min: 30, color: 'text-red-500', label: 'Muito quente' },
  { min: 20, color: 'text-orange-500', label: 'Quente' },
  { min: 10, color: 'text-green-500', label: 'Agradável' },
  { min: 0, color: 'text-blue-500', label: 'Frio' },
  { min: -Infinity, color: 'text-blue-700', label: 'Muito frio' },
] as const

const TEMP_SCALE_MIN = -10
const TEMP_SCALE_MAX = 40

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

const getTemperatureInfo = (temp: number) => {
  const range = TEMPERATURE_RANGES.find((r) => temp >= r.min)
  return {
    color: range?.color || 'text-blue-700',
    label: range?.label || 'Muito frio',
  }
}

const calculateTemperaturePosition = (temp: number) => {
  const percentage =
    ((temp - TEMP_SCALE_MIN) / (TEMP_SCALE_MAX - TEMP_SCALE_MIN)) * 100
  return Math.max(0, Math.min(95, percentage))
}

type WeatherProps = {
  temperature: number
  weather: string
  location: string
}

export const Weather = ({ temperature, weather, location }: WeatherProps) => {
  const weatherData = useMemo(() => {
    const condition = getWeatherCondition(weather)
    const config = weatherConfigs[condition]
    const tempInfo = getTemperatureInfo(temperature)
    const tempPosition = calculateTemperaturePosition(temperature)

    return {
      ...config,
      tempInfo,
      tempPosition,
      condition,
    }
  }, [weather, temperature])

  return (
    <div
      className="relative w-full min-w-[280px] max-w-[320px] overflow-hidden rounded-2xl border border-white/20 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      role="img"
      aria-label={`Clima em ${location}: ${weather}, ${Math.round(temperature)} graus Celsius`}
    >
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-500',
          weatherData.gradient,
        )}
      />

      <div className="relative space-y-4 p-6">
        <div className="flex items-center gap-1 text-sm font-medium text-foreground/80">
          <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span className="truncate" title={location}>
            {location}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animate-pulse" aria-hidden="true">
              {weatherData.icon}
            </div>
            <div>
              <div
                className={cn(
                  'text-4xl font-bold tracking-tight transition-colors duration-300',
                  weatherData.tempInfo.color,
                )}
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
          <Thermometer
            className="h-4 w-4 text-foreground/60"
            aria-hidden="true"
          />
          <span className="text-sm font-medium capitalize text-foreground/80">
            {weather}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-foreground/60">
            <span>Muito frio</span>
            <span>Muito quente</span>
          </div>
          <div
            className="relative h-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500"
            role="progressbar"
            aria-valuenow={temperature}
            aria-valuemin={TEMP_SCALE_MIN}
            aria-valuemax={TEMP_SCALE_MAX}
            aria-label={`Temperatura: ${temperature}°C (${weatherData.tempInfo.label})`}
          >
            <div
              className="absolute top-0 h-full w-1 rounded-full bg-white shadow-lg transition-all duration-700 ease-out"
              style={{
                left: `${weatherData.tempPosition}%`,
                transform: 'translateX(-50%)',
              }}
            />
          </div>
          <div className="text-center">
            <span
              className={cn('text-xs font-medium', weatherData.tempInfo.color)}
            >
              {weatherData.tempInfo.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
