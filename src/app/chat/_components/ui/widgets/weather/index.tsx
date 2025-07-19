'use client'

import {
  Cloud,
  Droplets,
  Gauge,
  Loader2,
  MapPin,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'
import React from 'react'
import Flags from 'react-world-flags'

import { WeatherToolResponse } from '@/app/api/chat/tools/weather'
import { Skeleton } from '@/components/ui/skeleton'
import { formatLocations } from '@/utils/format'
import { cn } from '@/utils/utils'

import {
  calculateTemperaturePosition,
  getTemperatureInfo,
  getWeatherCondition,
  TEMP_SCALE_MAX,
  TEMP_SCALE_MIN,
  weatherConfigs,
} from './definitions'

type WeatherCardProps = {
  result: WeatherToolResponse
}

const WeatherCard = ({ result }: WeatherCardProps) => {
  const formattedDescription =
    result.weather[0].description.charAt(0).toUpperCase() +
    result.weather[0].description.slice(1)

  const weatherData = React.useMemo(() => {
    const condition = getWeatherCondition(result.weather[0].main)
    const config = weatherConfigs[condition]
    const tempInfo = getTemperatureInfo(result.main.temp)
    const tempPosition = calculateTemperaturePosition(result.main.temp)

    return {
      icon: config.icon,
      gradient: config.gradient,
      tempInfo,
      tempPosition,
      condition,
    }
  }, [result.weather, result.main.temp])

  return (
    <div
      className="w-full min-w-[15rem] max-w-[18rem] overflow-hidden rounded-lg border border-input bg-card shadow-md transition-all duration-300 hover:shadow-xl"
      aria-label={`Clima em ${result.name}: ${result.weather[0].description}, ${Math.round(result.main.temp)} graus Celsius`}
    >
      <div className="space-y-4 p-3">
        <div className="flex items-center gap-1 text-sm font-medium text-foreground/80">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <Flags code={result.sys.country} className="size-4" /> -
            <span className="truncate" title={result.name}>
              {result.name}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center gap-2">
            <div className="animate-pulse" aria-hidden="true">
              {weatherData.icon}
            </div>
            <div>
              <span
                className={cn(
                  'text-4xl font-bold tracking-tight transition-colors duration-300',
                  weatherData.tempInfo.color,
                )}
              >
                {Math.round(result.main.temp)}°
              </span>
              <div className="text-sm font-medium text-foreground/60">
                Celsius
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center text-right text-sm text-foreground/70">
            <span className="text-foreground/70">
              Mín: {Math.round(result.main.temp_min)}°
            </span>
            <span className="text-foreground/70">
              Máx: {Math.round(result.main.temp_max)}°
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Thermometer
              className="h-4 w-4 text-foreground/60"
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-foreground/80">
              {formattedDescription}
            </span>
          </div>

          {result.main && (
            <div className="grid grid-cols-2 gap-2 border-y border-input py-2 text-xs text-foreground/70">
              <div className="flex items-center gap-1">
                <Thermometer className="h-3 w-3" />
                <span>Sensação: {Math.round(result.main.feels_like)}°</span>
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                <span>Umidade: {result.main.humidity}%</span>
              </div>
              {result.wind && (
                <div className="flex items-center gap-1">
                  <Wind className="h-3 w-3" />
                  <span>Vento: {Math.round(result.wind.speed * 3.6)} km/h</span>
                </div>
              )}
              {result.main.pressure && (
                <div className="flex items-center gap-1">
                  <Gauge className="h-3 w-3" />
                  <span>Pressão: {result.main.pressure} hPa</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-foreground/60">
            <span>Muito frio</span>
            <span>Muito quente</span>
          </div>
          <div
            className="relative h-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 from-[20%] via-yellow-500 via-[40%] to-red-500 to-[120%]"
            role="progressbar"
            aria-valuenow={result.main.temp}
            aria-valuemin={TEMP_SCALE_MIN}
            aria-valuemax={TEMP_SCALE_MAX}
            aria-label={`Temperatura: ${result.main.temp}°C (${weatherData.tempInfo.label})`}
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

function WeatherSkeleton({ location }: { location: string[] }) {
  return (
    <div className="relative w-full min-w-[15rem] max-w-[18rem] overflow-hidden rounded-3xl border border-input bg-card shadow-md">
      <div className="relative space-y-4 p-3">
        <div className="flex items-center justify-between gap-1 text-sm font-medium text-foreground/80">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <Skeleton className="h-4 w-5" />
            <span>-</span>
            {location.map((location, i) => (
              <Skeleton
                key={`weather-skeleton-${location}-${i}`}
                className="h-4 w-12"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-start gap-4">
          <div className="flex items-center gap-2">
            <div className="animate-pulse" aria-hidden="true">
              <Sun className="h-12 w-12 text-yellow-500" />
            </div>
            <div>
              <div className="flex items-baseline">
                <Skeleton className="h-8 w-12" />
                <span className="text-4xl font-bold tracking-tight text-primary/20">
                  °
                </span>
              </div>
              <div className="text-sm font-medium text-foreground/60">
                Celsius
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center text-right text-sm text-foreground/70">
            <span className="flex items-center text-foreground/70">
              Mín: <Skeleton className="ml-1 size-3.5 rounded-sm" />
              <span>°</span>
            </span>
            <span className="flex items-center text-foreground/70">
              Máx: <Skeleton className="ml-1 size-3.5 rounded-sm" />
              <span>°</span>
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Thermometer
              className="size-4 text-foreground/60"
              aria-hidden="true"
            />
            <Skeleton className="h-3 w-16" />
          </div>

          <div className="grid grid-cols-2 gap-2 border-y border-input py-2 text-xs text-foreground/70">
            <div className="flex items-center gap-1">
              <Thermometer className="size-3" />
              <span>Sensação:</span>
              <Skeleton className="size-3 rounded-sm" />
              <span>°</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="size-3" />
              <span>Umidade:</span>
              <Skeleton className="size-3 rounded-sm" />
              <span>%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="size-3" />
              <span>Vento:</span>
              <Skeleton className="size-3 rounded-sm" />
              <span>km/h</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="size-3" />
              <span>Pressão:</span>
              <Skeleton className="h-3 w-7 rounded-sm" />
              <span>hPa</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-foreground/60">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div
            className="relative h-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 from-[20%] via-yellow-500 via-[40%] to-red-500 to-[120%]"
            role="progressbar"
          />
          <div className="text-center">
            <Skeleton className="mx-auto h-3 w-20" />
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingWeather({ location }: { location: string[] }) {
  return (
    <div className="mr-auto rounded-lg bg-primary/10 p-3 text-card-foreground max-md:max-w-[95%] md:max-w-[80%] lg:max-w-[70%]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="flex animate-pulse items-center justify-center rounded-full bg-primary/15 p-1.5">
            <Cloud className="size-6 text-primary" />
          </div>
          <span className="text-xl font-medium text-muted-foreground">
            Informações do clima
          </span>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
            <span className="text-xs lg:text-sm">
              Buscando dados para {formatLocations(location)}...
            </span>
          </div>

          <div className="mb-2 flex items-center justify-between rounded-md bg-background/50 p-2.5">
            <div className="flex flex-col gap-1">
              <div className="h-4 w-20 animate-pulse rounded-md bg-primary/15" />
              <div className="h-2.5 w-28 animate-pulse rounded-md bg-primary/15" />
            </div>
            <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-primary/15">
              <Cloud className="size-6 text-primary" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {location.map((location: string, i: number) => (
              <div
                className="flex flex-col gap-2 rounded-md bg-background/50 p-2.5"
                key={`forecast-${location}-${i}`}
              >
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-primary/15" />
                  <div className="h-2.5 w-14 animate-pulse rounded-sm bg-primary/15" />
                </div>
                <div className="h-2 w-8 animate-pulse rounded-sm bg-primary/15" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { WeatherCard, WeatherSkeleton, LoadingWeather }
