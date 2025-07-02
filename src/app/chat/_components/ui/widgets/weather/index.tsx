'use client'

import {
  Droplets,
  Gauge,
  InfoIcon,
  MapPin,
  Thermometer,
  Wind,
} from 'lucide-react'
import React from 'react'
import Flags from 'react-world-flags'

import { WeatherToolResponse } from '@/app/api/chat/tools/weather'
import { Button } from '@/components/ui/button'
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

export const WeatherCard = ({ result }: WeatherCardProps) => {
  const formattedDescription =
    result.weather[0].description.charAt(0).toUpperCase() +
    result.weather[0].description.slice(1)

  const weatherData = React.useMemo(() => {
    const condition = getWeatherCondition(result.weather[0].main)
    const config = weatherConfigs[condition]
    const tempInfo = getTemperatureInfo(result.main.temp)
    const tempPosition = calculateTemperaturePosition(result.main.temp)

    return {
      ...config,
      tempInfo,
      tempPosition,
      condition,
    }
  }, [result.weather, result.main.temp])

  return (
    <div
      className="relative mt-1 w-full min-w-[16rem] max-w-[20rem] overflow-hidden rounded-3xl border border-white/20 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
      aria-label={`Clima em ${result.name}: ${result.weather[0].description}, ${Math.round(result.main.temp)} graus Celsius`}
    >
      <div
        className={cn(
          'absolute inset-0 opacity-50 transition-opacity duration-500',
          'bg-gradient-to-br from-[20%] via-[40%] to-[90%]',
          weatherData.gradient,
        )}
      />

      <div className="relative space-y-5 p-4">
        <div className="flex items-center justify-between gap-1 text-sm font-medium text-foreground/80">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <Flags code={result.sys.country} className="size-4" /> -
            <span className="truncate" title={result.name}>
              {result.name}
            </span>
          </div>
          <Button
            variant={'link'}
            size={'icon'}
            className={cn('rounded-full border-white/20')}
          >
            <InfoIcon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">Copiar localização</span>
          </Button>
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

          <div className="flex flex-col items-center gap-2 text-right text-sm text-foreground/70">
            <span className="text-foreground/70">
              Mín: {Math.round(result.main.temp_min)}°
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <Thermometer
              className="h-4 w-4 text-foreground/60"
              aria-hidden="true"
            />
            <span className="text-sm font-medium text-foreground/80">
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
            className="relative h-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500"
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
